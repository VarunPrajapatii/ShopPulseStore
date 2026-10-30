/**
 * React wrapper around the upload session controller for storefront return
 * photos (return submit and evidence replies).
 *
 * Owns wiring only: it builds the storefront transport
 * (`{API}/order/{orderId}/upload-sessions`, cookie credentials) and one
 * controller per order/purpose/scope, binds the page lifecycle so a closing
 * page discards its session, and disposes the controller on unmount or when
 * the scope changes (which also covers in-app navigation). All protocol rules
 * live in the controller.
 *
 * Also owns `describeReturnUploadFailure`, which turns any error thrown by
 * `submit` into "needs re-verification", "aborted" (the screen went away), a
 * customer-facing message, or null for business errors the caller handles
 * itself.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ReturnsApiError } from '@/lib/returns-api';
import {
  UploadAbortedError,
  UploadFailedError,
  UploadSessionController,
  type FileEntry,
  type SubmitResult,
  type UploadProgressEntry,
} from '@/lib/uploads/client/upload-session-controller';
import {
  UploadTransportError,
  createUploadSessionTransport,
} from '@/lib/uploads/client/upload-session-transport';
import { describeUploadError } from '@/lib/uploads/client/upload-error-messages';
import {
  isUploadErrorBody,
  type UploadErrorBody,
} from '@/lib/uploads/shared/upload-error-codes';
import type { UploadPurposeKey } from '@/lib/uploads/shared/upload-purpose-keys';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const AUTH_ERROR_CODES = new Set([
  'AUTH_REQUIRED',
  'SESSION_EXPIRED',
  'CAPABILITY_REQUIRED',
]);

type ReturnPhotoPurpose = Extract<
  UploadPurposeKey,
  'RETURN_EVIDENCE' | 'RETURN_EVIDENCE_RESPONSE'
>;

interface UseReturnUploadSessionOptions {
  orderId: string;
  purpose: ReturnPhotoPurpose;
  /** orderId for return submits, returnId for evidence replies. */
  scopeId: string | null;
}

function readUploadError(err: unknown): UploadErrorBody['uploadError'] | null {
  const body =
    err instanceof UploadTransportError || err instanceof ReturnsApiError
      ? err.body
      : null;
  return isUploadErrorBody(body) ? body.uploadError : null;
}

export type ReturnUploadFailure =
  | { kind: 'auth' }
  /** The screen went away mid-save; show nothing. */
  | { kind: 'aborted' }
  | { kind: 'message'; message: string; invalidClientKeys: string[] };

function message(text: string, invalidClientKeys: string[] = []) {
  return { kind: 'message' as const, message: text, invalidClientKeys };
}

/** Null means the error is not about photos; handle it as a business error. */
export function describeReturnUploadFailure(
  err: unknown
): ReturnUploadFailure | null {
  if (err instanceof UploadAbortedError) return { kind: 'aborted' };
  if (err instanceof UploadFailedError) {
    return message(
      'Some photos failed to upload. Check your connection and submit again.'
    );
  }

  if (err instanceof UploadTransportError) {
    const code = (err.body as { error?: unknown } | null)?.error;
    if (
      err.status === 401 ||
      (typeof code === 'string' && AUTH_ERROR_CODES.has(code))
    ) {
      return { kind: 'auth' };
    }
    if (err.status === 0) {
      return message('Couldn’t reach the store. Please check your connection.');
    }
  }

  const uploadError = readUploadError(err);
  if (!uploadError) {
    return err instanceof UploadTransportError
      ? message('Couldn’t upload your photos. Please try again.')
      : null;
  }

  switch (uploadError.code) {
    case 'UPLOAD_INVALID': {
      const invalid = uploadError.details?.invalid;
      const keys = Array.isArray(invalid)
        ? invalid.flatMap((entry) => {
            const key = (entry as { clientKey?: unknown } | null)?.clientKey;
            return typeof key === 'string' ? [key] : [];
          })
        : [];
      return message(
        'Some photos couldn’t be processed and were removed. Please add them again.',
        keys
      );
    }
    case 'UPLOAD_INCOMPLETE':
    case 'SESSION_NOT_FOUND':
    case 'SESSION_NOT_OPEN':
      return message('Your photo upload expired. Please submit again.');
    default:
      return message(describeUploadError(uploadError));
  }
}

export function useReturnUploadSession({
  orderId,
  purpose,
  scopeId,
}: UseReturnUploadSessionOptions) {
  const [progress, setProgress] = useState<
    Record<string, UploadProgressEntry>
  >({});

  // Built per mount: a disposed controller is dead for good, and StrictMode
  // re-runs effects on the same render.
  const controllerRef = useRef<UploadSessionController | null>(null);
  useEffect(() => {
    const controller = new UploadSessionController({
      transport: createUploadSessionTransport({
        baseUrl: `${API_URL}/order/${orderId}/upload-sessions`,
        credentials: 'include',
      }),
      purpose,
      scopeId,
      readUploadError,
      onProgress: (snapshot) =>
        setProgress(
          Object.fromEntries(snapshot.map((entry) => [entry.clientKey, entry]))
        ),
    });
    controllerRef.current = controller;
    const unbind = controller.bindPageLifecycle(window);
    return () => {
      unbind();
      controller.dispose();
      if (controllerRef.current === controller) controllerRef.current = null;
    };
  }, [orderId, purpose, scopeId]);

  const submit = useCallback(
    <T>(
      files: FileEntry[],
      send: (uploadSessionId: string | null) => Promise<T>
    ): Promise<SubmitResult<T>> => {
      const controller = controllerRef.current;
      if (!controller) return Promise.reject(new UploadAbortedError());
      return controller.submit(files, send);
    },
    []
  );

  /** Discards the open session, if any (e.g. the reply can no longer be sent). */
  const abandon = useCallback(
    () => controllerRef.current?.abandon('keepalive'),
    []
  );

  const clearProgress = useCallback(() => setProgress({}), []);

  return { submit, abandon, progress, clearProgress };
}
