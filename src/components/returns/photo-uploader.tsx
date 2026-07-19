'use client';

/**
 * PhotoUploader — per-unit photo grid for reasons that require photos.
 *
 * One grid per unit when qty > 1 (each unit capped at `maxImagesPerUnit`).
 * Upload flow: client validates type/size, then `uploadReturnPhoto`
 * (signature → direct Cloudinary POST) → stores the returned `secure_url`.
 * Each tile shows its own spinner; failures show a red border + retry.
 *
 * Photos are kept as a FLAT `string[]` on the slice (per the submit contract);
 * this component maps the flat array onto N per-unit buckets for display.
 */

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, RotateCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReturnsApiError, uploadReturnPhoto } from '@/lib/returns-api';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB client guard; server caps too.

interface PhotoUploaderProps {
  orderId: string;
  orderItemId: string;
  quantity: number;
  maxImagesPerUnit: number;
  /** Flat list of already-uploaded secure_urls. */
  photos: string[];
  onChange: (photos: string[]) => void;
}

interface UploadingTile {
  unitIndex: number;
  tempId: string;
  failed: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  orderId,
  orderItemId,
  quantity,
  maxImagesPerUnit,
  photos,
  onChange,
}) => {
  const [uploading, setUploading] = useState<UploadingTile[]>([]);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Distribute the flat photos array across units round-robin-by-fill: simplest
  // stable mapping is sequential buckets of size maxImagesPerUnit.
  const bucketFor = (unitIndex: number): string[] =>
    photos.slice(
      unitIndex * maxImagesPerUnit,
      unitIndex * maxImagesPerUnit + maxImagesPerUnit
    );

  const validate = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Please upload a JPEG, PNG, WEBP, or HEIC image.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'That image is too large (max 10 MB).';
    }
    return null;
  };

  const runUpload = async (unitIndex: number, file: File, tempId: string) => {
    setUploading((u) => [...u, { unitIndex, tempId, failed: false }]);
    try {
      const url = await uploadReturnPhoto(orderId, {
        orderItemId,
        unitIndex,
        file,
      });
      onChange([...photos, url]);
      setUploading((u) => u.filter((t) => t.tempId !== tempId));
    } catch (err) {
      setUploading((u) =>
        u.map((t) => (t.tempId === tempId ? { ...t, failed: true } : t))
      );
      const code = err instanceof ReturnsApiError ? err.code : 'UNKNOWN';
      toast.error(
        code === 'UPLOAD_FAILED' || code === 'UPLOAD_NETWORK_ERROR'
          ? 'Upload failed. Tap retry to try again.'
          : 'Couldn’t upload that photo.'
      );
    }
  };

  const handleFiles = (unitIndex: number, files: FileList | null) => {
    if (!files) return;
    const current = bucketFor(unitIndex).length;
    const remaining = maxImagesPerUnit - current;
    const toUpload = Array.from(files).slice(0, Math.max(0, remaining));
    if (Array.from(files).length > toUpload.length) {
      toast.error(
        `Up to ${maxImagesPerUnit} photo${maxImagesPerUnit === 1 ? '' : 's'} per item.`
      );
    }
    for (const file of toUpload) {
      const error = validate(file);
      if (error) {
        toast.error(error);
        continue;
      }
      void runUpload(
        unitIndex,
        file,
        `${unitIndex}-${file.name}-${Date.now()}-${Math.random()}`
      );
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  const retryTile = (tempId: string) => {
    setUploading((u) => u.filter((t) => t.tempId !== tempId));
    // The original File isn't retained; prompt the user to re-pick. Simpler &
    // avoids holding File refs in state. Open the unit's picker again.
    const tile = uploading.find((t) => t.tempId === tempId);
    if (tile) inputRefs.current[tile.unitIndex]?.click();
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: quantity }).map((_, unitIndex) => {
        const bucket = bucketFor(unitIndex);
        const tiles = uploading.filter((t) => t.unitIndex === unitIndex);
        const full = bucket.length >= maxImagesPerUnit;

        return (
          <div key={unitIndex}>
            {quantity > 1 && (
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                Unit {unitIndex + 1}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {bucket.map((url) => (
                <div
                  key={url}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted"
                >
                  <Image
                    src={url}
                    alt="Return photo"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    aria-label="Remove photo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {tiles.map((tile) => (
                <div
                  key={tile.tempId}
                  className={cn(
                    'flex h-20 w-20 items-center justify-center rounded-lg border bg-muted',
                    tile.failed ? 'border-red-400' : 'border-border'
                  )}
                >
                  {tile.failed ? (
                    <button
                      type="button"
                      onClick={() => retryTile(tile.tempId)}
                      className="flex flex-col items-center gap-1 text-xs text-red-500"
                    >
                      <RotateCw size={16} />
                      Retry
                    </button>
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  )}
                </div>
              ))}

              {!full && (
                <button
                  type="button"
                  onClick={() => inputRefs.current[unitIndex]?.click()}
                  className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  <ImagePlus size={18} />
                  Add
                </button>
              )}

              <input
                ref={(el) => {
                  inputRefs.current[unitIndex] = el;
                }}
                type="file"
                accept={ACCEPTED_TYPES.join(',')}
                multiple={maxImagesPerUnit > 1}
                className="hidden"
                onChange={(e) => {
                  handleFiles(unitIndex, e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PhotoUploader;
