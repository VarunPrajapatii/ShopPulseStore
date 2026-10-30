/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/shared/upload-purpose-keys.ts).
 * Change it there first, then copy it here.
 *
 * Upload purpose keys, shared by the admin dashboard and the storefront.
 *
 * Owns the closed list of things an image upload can be for. The browser sends
 * one of these keys when it opens an upload session; the server maps it to a
 * rule (folder, limits, owner) and never trusts anything else about the
 * destination.
 *
 * Client-safe: no server or Prisma imports. The server keeps this list in sync
 * with the database enum at compile time.
 */

export const UPLOAD_PURPOSE_KEYS = [
  'PRODUCT_IMAGE',
  'BILLBOARD_IMAGE',
  'CATEGORY_IMAGE',
  'UPCOMING_PRODUCT_IMAGE',
  'PROMOTIONAL_BANNER',
  'RETURN_REJECTION_EVIDENCE',
  'RETURN_INSPECTION_PHOTO',
  'RETURN_EVIDENCE',
  'RETURN_EVIDENCE_RESPONSE',
] as const;

export type UploadPurposeKey = (typeof UPLOAD_PURPOSE_KEYS)[number];
