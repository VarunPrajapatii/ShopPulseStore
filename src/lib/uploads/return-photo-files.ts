/**
 * In-memory holder for return photos the customer has picked but not sent.
 *
 * Owns the actual `File` objects and their preview blob URLs, keyed by a
 * random `clientKey`. Only the keys are stored anywhere else (the return
 * basket persists them to sessionStorage); the files themselves never leave
 * this module until the customer submits, at which point the upload session
 * controller uploads them and the server attaches them atomically.
 *
 * Rules:
 *  - Picking a photo uploads nothing. Removing one just forgets it here.
 *  - A full page reload empties this store, so callers must treat a key with
 *    no file as "photo lost, please add it again".
 *  - Owners call `releasePickedPhotos` once keys are no longer referenced so
 *    preview blob URLs are revoked.
 */

import { UPLOAD_ALLOWED_CONTENT_TYPES } from '@/lib/uploads/shared/upload-content-types';
import type { FileEntry } from '@/lib/uploads/client/upload-session-controller';

/** Must match the server's per-photo cap for return photos. */
export const RETURN_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const RETURN_PHOTO_ACCEPT = UPLOAD_ALLOWED_CONTENT_TYPES.join(',');

export interface PickedPhoto {
  file: File;
  previewUrl: string;
}

const picked = new Map<string, PickedPhoto>();

function newClientKey(): string {
  // getRandomValues also works on plain-http origins, unlike randomUUID.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Returns a customer-facing reason when the file cannot be used, else null. */
export function validateReturnPhoto(file: File): string | null {
  if (!UPLOAD_ALLOWED_CONTENT_TYPES.includes(file.type)) {
    return 'Please add a JPG, PNG, WebP, AVIF, HEIC or GIF photo.';
  }
  if (file.size <= 0 || file.size > RETURN_PHOTO_MAX_BYTES) {
    return 'That photo is too large (max 5 MB).';
  }
  return null;
}

/** Stores the files and returns one new key per file, in order. */
export function addPickedPhotos(files: readonly File[]): string[] {
  return files.map((file) => {
    const key = newClientKey();
    picked.set(key, { file, previewUrl: URL.createObjectURL(file) });
    return key;
  });
}

export function getPickedPhoto(key: string): PickedPhoto | undefined {
  return picked.get(key);
}

export function hasPickedPhoto(key: string): boolean {
  return picked.has(key);
}

/** Upload entries for the keys that still have a file, in key order. */
export function pickedPhotoEntries(keys: readonly string[]): FileEntry[] {
  return keys.flatMap((clientKey) => {
    const photo = picked.get(clientKey);
    return photo ? [{ clientKey, file: photo.file }] : [];
  });
}

export function releasePickedPhotos(keys: Iterable<string>): void {
  for (const key of keys) {
    const photo = picked.get(key);
    if (!photo) continue;
    URL.revokeObjectURL(photo.previewUrl);
    picked.delete(key);
  }
}
