/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/client/upload-session-transport.ts).
 * Change it there first, then copy it here.
 *
 * Upload session transport (browser side).
 *
 * Owns every network call the upload controller makes: opening a session,
 * heartbeats, discarding (including the fire-and-forget form used while the
 * page is closing) and the direct signed upload of one file to Cloudinary.
 * The session route base URL and fetch credentials are injected, so the same
 * file works for the admin dashboard and the storefront.
 *
 * Rules: the file upload posts exactly the server-provided `fields` plus
 * `file` and nothing else; `discard` never throws; a failed upload is
 * classified as retryable, rejected, or session-expired so the controller can
 * react without parsing messages.
 *
 * Client-safe: imports only `shared/`. When mirrored to another repo, keep the
 * file unchanged.
 */

import type {
  OpenUploadSessionRequest,
  OpenUploadSessionResponse,
  SignedUploadSlot,
} from '../shared/upload-api-types';

/** Non-2xx response from a session route; `body` is the parsed JSON, if any. */
export class UploadTransportError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(`Upload session request failed (${status})`);
    this.name = 'UploadTransportError';
  }
}

export type UploadFileFailureKind =
  'session-expired' | 'rejected' | 'retryable';

export class UploadFileError extends Error {
  constructor(
    public readonly kind: UploadFileFailureKind,
    message: string
  ) {
    super(message);
    this.name = 'UploadFileError';
  }
}

export type HeartbeatResult = 'ok' | 'dead' | 'network-error';
export type DiscardMode = 'beacon' | 'keepalive';

export interface UploadSessionTransport {
  open(body: OpenUploadSessionRequest): Promise<OpenUploadSessionResponse>;
  heartbeat(sessionId: string): Promise<HeartbeatResult>;
  discard(sessionId: string, mode: DiscardMode): void;
  uploadFile(
    slot: SignedUploadSlot,
    file: File,
    onProgress: (percent: number) => void
  ): Promise<void>;
}

export function createUploadSessionTransport(opts: {
  baseUrl: string;
  credentials?: RequestCredentials;
}): UploadSessionTransport {
  const { baseUrl } = opts;
  const credentials = opts.credentials ?? 'same-origin';

  async function parseJson(res: Response): Promise<unknown> {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  return {
    async open(body) {
      let res: Response;
      try {
        res = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials,
          body: JSON.stringify(body),
        });
      } catch {
        throw new UploadTransportError(0, null);
      }
      if (!res.ok)
        throw new UploadTransportError(res.status, await parseJson(res));
      return (await res.json()) as OpenUploadSessionResponse;
    },

    async heartbeat(sessionId) {
      try {
        const res = await fetch(`${baseUrl}/${sessionId}/heartbeat`, {
          method: 'POST',
          credentials,
        });
        if (res.ok) return 'ok';
        return res.status === 404 || res.status === 409
          ? 'dead'
          : 'network-error';
      } catch {
        return 'network-error';
      }
    },

    discard(sessionId, mode) {
      const url = `${baseUrl}/${sessionId}/discard`;
      try {
        if (
          mode === 'beacon' &&
          typeof navigator !== 'undefined' &&
          typeof navigator.sendBeacon === 'function' &&
          navigator.sendBeacon(url)
        ) {
          return;
        }
        void fetch(url, { method: 'POST', keepalive: true, credentials }).catch(
          () => {}
        );
      } catch {
        // Best effort: the server-side lease expiry closes the session anyway.
      }
    },

    uploadFile(slot, file, onProgress) {
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', slot.uploadUrl);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && event.total > 0) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
            return;
          }
          if (xhr.status >= 400 && xhr.status < 500) {
            const message = readCloudinaryMessage(xhr.responseText);
            const expired = /stale request|expired/i.test(message);
            reject(
              new UploadFileError(
                expired ? 'session-expired' : 'rejected',
                message
              )
            );
            return;
          }
          reject(
            new UploadFileError('retryable', `Upload failed (${xhr.status})`)
          );
        };
        xhr.onerror = () =>
          reject(
            new UploadFileError('retryable', 'Network error during upload')
          );
        xhr.ontimeout = () =>
          reject(new UploadFileError('retryable', 'Upload timed out'));

        const form = new FormData();
        for (const [key, value] of Object.entries(slot.fields)) {
          form.append(key, value);
        }
        form.append('file', file);
        xhr.send(form);
      });
    },
  };
}

function readCloudinaryMessage(responseText: string): string {
  try {
    const parsed = JSON.parse(responseText) as { error?: { message?: string } };
    return parsed.error?.message ?? 'Upload rejected';
  } catch {
    return 'Upload rejected';
  }
}
