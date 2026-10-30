/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/shared/upload-error-codes.ts).
 * Change it there first, then copy it here.
 *
 * Upload error codes and the JSON body shape that carries them.
 *
 * Owns the vocabulary both sides use to talk about upload failures: the server
 * responds with `{ uploadError: { code, details? } }` and the client controller
 * decides whether to retry, re-open the session or show a message based on the
 * code alone.
 *
 * Client-safe: no server or Prisma imports.
 */

export const UPLOAD_ERROR_CODES = [
  'INVALID_REQUEST',
  'PURPOSE_NOT_ALLOWED',
  'SCOPE_NOT_ALLOWED',
  'SESSION_NOT_FOUND',
  'SESSION_NOT_OPEN',
  'SESSION_ALREADY_FINALIZED',
  'SESSION_PURPOSE_MISMATCH',
  'SESSION_SCOPE_MISMATCH',
  'SLOT_SET_MISMATCH',
  'UPLOAD_INCOMPLETE',
  'UPLOAD_INVALID',
  'TOO_MANY_FILES',
  'FILE_TOO_LARGE',
  'INVALID_CONTENT_TYPE',
  'TOO_MANY_OPEN_SESSIONS',
  'CLOUDINARY_UNAVAILABLE',
  'CLOUDINARY_NOT_CONFIGURED',
] as const;

export type UploadErrorCode = (typeof UPLOAD_ERROR_CODES)[number];

export interface UploadErrorBody {
  uploadError: {
    code: UploadErrorCode;
    details?: Record<string, unknown>;
  };
}

const KNOWN_CODES: ReadonlySet<string> = new Set(UPLOAD_ERROR_CODES);

export function isUploadErrorBody(value: unknown): value is UploadErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const inner = (value as { uploadError?: unknown }).uploadError;
  if (typeof inner !== 'object' || inner === null) return false;
  const code = (inner as { code?: unknown }).code;
  return typeof code === 'string' && KNOWN_CODES.has(code);
}
