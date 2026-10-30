/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/client/upload-session-controller.ts).
 * Change it there first, then copy it here.
 *
 * Upload session controller (browser side, framework-agnostic).
 *
 * Owns the whole client protocol for "upload these files, then save":
 *
 *  1. `submit(files, send)` opens a server-side session, uploads each file
 *     directly to its signed Cloudinary slot (3 at a time, with retries),
 *     keeps a heartbeat going while the session is open, then calls the
 *     caller's `send(uploadSessionId)` to perform the business save.
 *  2. If the session turns out to be dead, incomplete or already finalized it
 *     reacts automatically (re-open, re-upload missing files, treat a replayed
 *     save as success) before giving up after two attempts.
 *  3. The page lifecycle hooks discard the session when the page is closed and
 *     never react to tab switches. After `dispose()` the controller is dead: a
 *     save still in flight stops with `UploadAbortedError` instead of
 *     re-opening a session or saving for a page that has gone away.
 *
 * Failures that are not about uploads (business validation, network errors on
 * save) are rethrown untouched and the session stays open so the next save
 * reuses the already uploaded files.
 *
 * Client-safe: imports only `shared/` and the transport. When mirrored to
 * another repo, keep the file unchanged.
 */

import type { SignedUploadSlot } from '../shared/upload-api-types';
import type { UploadErrorBody } from '../shared/upload-error-codes';
import type { UploadPurposeKey } from '../shared/upload-purpose-keys';
import {
  UploadFileError,
  type DiscardMode,
  type UploadSessionTransport,
} from './upload-session-transport';

const UPLOAD_POOL_SIZE = 3;
const MAX_SUBMIT_ATTEMPTS = 2;
/** Delays before the 1st and 2nd retry of a single file. */
const FILE_RETRY_DELAYS_MS = [1000, 3000] as const;

export type FileEntry = { clientKey: string; file: File };

export type SubmitResult<T> =
  | { kind: 'ok'; value: T }
  | { kind: 'already-saved'; resultEntityId: string | null };

export type UploadProgressState = 'queued' | 'uploading' | 'done' | 'failed';

export interface UploadProgressEntry {
  clientKey: string;
  percent: number;
  state: UploadProgressState;
}

/** One or more files could not be uploaded; the session is still open. */
export class UploadFailedError extends Error {
  constructor(
    public readonly clientKeys: string[],
    message = 'Some files failed to upload'
  ) {
    super(message);
    this.name = 'UploadFailedError';
  }
}

/** Internal: the session can no longer accept uploads. */
class SessionExpiredSignal extends Error {
  constructor() {
    super('Upload session expired');
    this.name = 'SessionExpiredSignal';
  }
}

/** The controller was disposed (page or form went away) while a save was running. */
export class UploadAbortedError extends Error {
  constructor() {
    super('Upload was cancelled');
    this.name = 'UploadAbortedError';
  }
}

interface ActiveSession {
  sessionId: string;
  fingerprint: string;
  slots: Map<string, SignedUploadSlot>;
  done: Set<string>;
  alive: boolean;
  timer: ReturnType<typeof setInterval> | null;
}

export interface UploadSessionControllerOptions {
  transport: UploadSessionTransport;
  purpose: UploadPurposeKey;
  scopeId?: string | null;
  nameHint?: () => string | undefined;
  /** Extracts the upload error from whatever the caller's HTTP client throws. */
  readUploadError: (err: unknown) => UploadErrorBody['uploadError'] | null;
  onProgress?: (snapshot: UploadProgressEntry[]) => void;
}

function fingerprintOf(files: readonly FileEntry[]): string {
  return files
    .map((f) => `${f.clientKey}:${f.file.size}:${f.file.lastModified}`)
    .sort()
    .join('|');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class UploadSessionController {
  private active: ActiveSession | null = null;
  private progress = new Map<string, UploadProgressEntry>();
  private disposed = false;

  constructor(private readonly opts: UploadSessionControllerOptions) {}

  async submit<T>(
    files: FileEntry[],
    send: (uploadSessionId: string | null) => Promise<T>
  ): Promise<SubmitResult<T>> {
    this.throwIfDisposed();
    if (files.length === 0) {
      this.abandon('keepalive');
      return { kind: 'ok', value: await send(null) };
    }

    let lastError: unknown = new Error('Upload could not be completed');

    for (let attempt = 0; attempt < MAX_SUBMIT_ATTEMPTS; attempt++) {
      this.throwIfDisposed();
      let session: ActiveSession;
      try {
        session = await this.ensureUploaded(files);
      } catch (err) {
        this.throwIfDisposed();
        if (err instanceof SessionExpiredSignal) {
          lastError = err;
          continue;
        }
        throw err;
      }
      // Never save on behalf of a page that has already gone away.
      this.throwIfDisposed();

      try {
        const value = await send(session.sessionId);
        this.clearActive();
        return { kind: 'ok', value };
      } catch (err) {
        const uploadError = this.opts.readUploadError(err);
        if (!uploadError) throw err;
        lastError = err;

        switch (uploadError.code) {
          case 'SESSION_ALREADY_FINALIZED': {
            this.clearActive();
            const id = uploadError.details?.resultEntityId;
            return {
              kind: 'already-saved',
              resultEntityId: typeof id === 'string' ? id : null,
            };
          }
          case 'SESSION_NOT_OPEN':
          case 'SESSION_NOT_FOUND':
            this.markDead(session);
            continue;
          case 'UPLOAD_INCOMPLETE': {
            const missing = uploadError.details?.missingClientKeys;
            if (Array.isArray(missing)) {
              for (const key of missing) {
                if (typeof key === 'string') session.done.delete(key);
              }
            }
            continue;
          }
          case 'UPLOAD_INVALID':
            this.clearActive();
            throw err;
          default:
            throw err;
        }
      }
    }

    throw lastError;
  }

  /** Discards the active session, if any. Safe to call repeatedly. */
  abandon(mode: DiscardMode): void {
    const session = this.active;
    if (!session) return;
    this.clearActive();
    this.opts.transport.discard(session.sessionId, mode);
  }

  /** Returns an unbind function. Tab visibility changes are deliberately ignored. */
  bindPageLifecycle(win: Window): () => void {
    const onPageHide = () => this.abandon('beacon');
    const onPageShow = (event: PageTransitionEvent) => {
      // A page restored from the back/forward cache must re-open on next save.
      if (event.persisted && this.active) this.markDead(this.active);
    };
    win.addEventListener('pagehide', onPageHide);
    win.addEventListener('pageshow', onPageShow);
    return () => {
      win.removeEventListener('pagehide', onPageHide);
      win.removeEventListener('pageshow', onPageShow);
    };
  }

  dispose(): void {
    this.disposed = true;
    this.abandon('keepalive');
  }

  private throwIfDisposed(): void {
    if (this.disposed) throw new UploadAbortedError();
  }

  private async ensureUploaded(files: FileEntry[]): Promise<ActiveSession> {
    const fingerprint = fingerprintOf(files);
    let session = this.active;
    if (!session || !session.alive || session.fingerprint !== fingerprint) {
      this.abandon('keepalive');
      session = await this.openSession(files, fingerprint);
    }

    const current = session;
    this.resetProgress(files, current);
    const pending = files.filter((f) => !current.done.has(f.clientKey));
    await this.uploadAll(current, pending);
    return current;
  }

  private async openSession(
    files: FileEntry[],
    fingerprint: string
  ): Promise<ActiveSession> {
    const response = await this.opts.transport.open({
      purpose: this.opts.purpose,
      scopeId: this.opts.scopeId ?? null,
      nameHint: this.opts.nameHint?.(),
      files: files.map(({ clientKey, file }) => ({
        clientKey,
        sizeBytes: file.size,
        contentType: file.type,
      })),
    });

    const slots = new Map(response.slots.map((slot) => [slot.clientKey, slot]));
    if (files.some((f) => !slots.has(f.clientKey))) {
      throw new Error('Upload session response is missing file slots');
    }
    if (this.disposed) {
      // Disposed while the open request was in flight: release it right away.
      this.opts.transport.discard(response.sessionId, 'keepalive');
      throw new UploadAbortedError();
    }

    const session: ActiveSession = {
      sessionId: response.sessionId,
      fingerprint,
      slots,
      done: new Set(),
      alive: true,
      timer: null,
    };
    session.timer = setInterval(() => {
      void this.beat(session);
    }, response.heartbeatIntervalMs);
    this.active = session;
    return session;
  }

  private async beat(session: ActiveSession): Promise<void> {
    if (!session.alive) return;
    const result = await this.opts.transport.heartbeat(session.sessionId);
    if (result === 'dead') this.markDead(session);
  }

  private async uploadAll(
    session: ActiveSession,
    pending: FileEntry[]
  ): Promise<void> {
    const queue = [...pending];
    const failed: string[] = [];
    let expired = false;

    const worker = async () => {
      while (queue.length > 0 && !expired && !this.disposed) {
        const entry = queue.shift()!;
        try {
          await this.uploadOne(session, entry);
        } catch (err) {
          if (
            err instanceof UploadFileError &&
            err.kind === 'session-expired'
          ) {
            expired = true;
          } else {
            failed.push(entry.clientKey);
          }
        }
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(UPLOAD_POOL_SIZE, queue.length) }, worker)
    );

    if (expired) {
      this.markDead(session);
      throw new SessionExpiredSignal();
    }
    if (failed.length > 0) throw new UploadFailedError(failed);
  }

  private async uploadOne(
    session: ActiveSession,
    entry: FileEntry
  ): Promise<void> {
    const slot = session.slots.get(entry.clientKey)!;

    for (let retry = 0; ; retry++) {
      this.setProgress(entry.clientKey, 0, 'uploading');
      try {
        await this.opts.transport.uploadFile(slot, entry.file, (percent) =>
          this.setProgress(entry.clientKey, percent, 'uploading')
        );
        session.done.add(entry.clientKey);
        this.setProgress(entry.clientKey, 100, 'done');
        return;
      } catch (err) {
        const canRetry =
          err instanceof UploadFileError &&
          err.kind === 'retryable' &&
          retry < FILE_RETRY_DELAYS_MS.length;
        if (!canRetry) {
          this.setProgress(entry.clientKey, 0, 'failed');
          throw err;
        }
        await sleep(FILE_RETRY_DELAYS_MS[retry]);
      }
    }
  }

  private resetProgress(files: FileEntry[], session: ActiveSession): void {
    this.progress = new Map(
      files.map(({ clientKey }) => {
        const done = session.done.has(clientKey);
        const entry: UploadProgressEntry = {
          clientKey,
          percent: done ? 100 : 0,
          state: done ? 'done' : 'queued',
        };
        return [clientKey, entry];
      })
    );
    this.emitProgress();
  }

  private setProgress(
    clientKey: string,
    percent: number,
    state: UploadProgressState
  ): void {
    this.progress.set(clientKey, { clientKey, percent, state });
    this.emitProgress();
  }

  private emitProgress(): void {
    this.opts.onProgress?.(
      Array.from(this.progress.values(), (entry) => ({ ...entry }))
    );
  }

  private markDead(session: ActiveSession): void {
    session.alive = false;
    this.stopHeartbeat(session);
  }

  private stopHeartbeat(session: ActiveSession): void {
    if (session.timer !== null) {
      clearInterval(session.timer);
      session.timer = null;
    }
  }

  private clearActive(): void {
    if (!this.active) return;
    this.stopHeartbeat(this.active);
    this.active = null;
  }
}
