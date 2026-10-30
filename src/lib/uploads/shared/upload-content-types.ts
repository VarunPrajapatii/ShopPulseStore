/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/shared/upload-content-types.ts).
 * Change it there first, then copy it here.
 *
 * Image content types accepted by the upload session system.
 *
 * Owns the single list of MIME types a browser may upload, shared by the
 * server (which validates declared types when opening a session) and the
 * client (which filters selected files before anything is sent). SVG is
 * deliberately absent.
 *
 * Client-safe: no server or Prisma imports.
 */

export const UPLOAD_ALLOWED_CONTENT_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/gif',
];
