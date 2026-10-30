/**
 * Mirrored verbatim from the ShopPulse admin repo (src/lib/uploads/shared/upload-api-types.ts).
 * Change it there first, then copy it here.
 *
 * Request/response shapes for the upload session routes and for image
 * selections inside business save payloads.
 *
 * Owns the wire contract only: no logic. The open request lists the files the
 * browser intends to upload (metadata, not bytes); the response hands back one
 * signed upload target per file, keyed by the same `clientKey`.
 *
 * Client-safe: no server or Prisma imports.
 */

import type { UploadPurposeKey } from './upload-purpose-keys';

export interface OpenUploadSessionFile {
  /** Browser-generated id for a local file; echoed back on its signed slot. */
  clientKey: string;
  sizeBytes: number;
  contentType: string;
}

export interface OpenUploadSessionRequest {
  purpose: UploadPurposeKey;
  /** orderId or returnId for purposes that are scoped; null/omitted otherwise. */
  scopeId?: string | null;
  /** Optional readable hint used in the stored file name. */
  nameHint?: string;
  files: OpenUploadSessionFile[];
}

export interface SignedUploadSlot {
  clientKey: string;
  uploadUrl: string;
  /** Exact multipart fields to send alongside `file`; nothing else may be added. */
  fields: Record<string, string>;
}

export interface OpenUploadSessionResponse {
  sessionId: string;
  heartbeatIntervalMs: number;
  /** ISO timestamp. */
  leaseExpiresAt: string;
  slots: SignedUploadSlot[];
}

export interface HeartbeatUploadSessionResponse {
  /** ISO timestamp. */
  leaseExpiresAt: string;
}

/**
 * How a save payload refers to one image: either an image the entity already
 * owns (matched by URL against current database rows) or a newly uploaded one
 * (matched by the clientKey of a session slot).
 */
export type ImageSelection =
  | { kind: 'existing'; url: string; altText?: string }
  | { kind: 'new'; clientKey: string; altText?: string };
