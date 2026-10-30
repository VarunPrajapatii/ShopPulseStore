/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/client/upload-error-messages.ts).
 * Change it there first, then copy it here.
 *
 * User-facing copy for upload errors.
 *
 * Owns the mapping from an upload error code (plus its details) to a short
 * message a seller or customer can act on. Kept separate from the controller
 * so every form and toast helper words these failures the same way.
 *
 * Client-safe: imports only `shared/`. When mirrored to another repo, keep the
 * file unchanged.
 */

import type { UploadErrorBody } from '../shared/upload-error-codes';

function megabytes(bytes: unknown): string | null {
  if (typeof bytes !== 'number' || bytes <= 0) return null;
  return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
}

export function describeUploadError(
  error: UploadErrorBody['uploadError']
): string {
  const { code, details } = error;
  switch (code) {
    case 'UPLOAD_INVALID':
      return "Some photos couldn't be processed, please re-select them.";
    case 'UPLOAD_INCOMPLETE':
      return 'Some photos did not finish uploading. Press Save again to retry.';
    case 'SESSION_NOT_FOUND':
    case 'SESSION_NOT_OPEN':
      return 'The upload expired. Press Save again to retry.';
    case 'SESSION_ALREADY_FINALIZED':
      return 'This was already saved.';
    case 'SESSION_PURPOSE_MISMATCH':
    case 'SESSION_SCOPE_MISMATCH':
    case 'SLOT_SET_MISMATCH':
    case 'INVALID_REQUEST':
      return 'The upload did not match the form. Reload the page and try again.';
    case 'PURPOSE_NOT_ALLOWED':
    case 'SCOPE_NOT_ALLOWED':
      return 'You are not allowed to upload photos here.';
    case 'TOO_MANY_FILES': {
      const max = details?.max;
      return typeof max === 'number'
        ? `Too many photos selected. The maximum is ${max}.`
        : 'Too many photos selected.';
    }
    case 'FILE_TOO_LARGE': {
      const limit = megabytes(details?.maxBytes);
      return limit
        ? `A photo is too large. The maximum size is ${limit}.`
        : 'A photo is too large.';
    }
    case 'INVALID_CONTENT_TYPE':
      return 'Only JPG, PNG, WebP, AVIF, HEIC or GIF photos are allowed.';
    case 'TOO_MANY_OPEN_SESSIONS':
      return 'Too many uploads are in progress. Wait a moment and try again.';
    case 'CLOUDINARY_UNAVAILABLE':
      return 'The image service is temporarily unavailable. Try again in a moment.';
    case 'CLOUDINARY_NOT_CONFIGURED':
      return 'Image uploads are not set up yet.';
  }
}
