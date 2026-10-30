'use client';

/**
 * PhotoUploader — picks return photos; uploads nothing by itself.
 *
 * Selecting files only validates them (type, size, count) and keeps them in
 * the in-memory picked-photo store; the parent receives the new list of
 * `clientKey`s. Removing a tile just drops its key. Bytes travel to the
 * server only when the parent submits through the upload session controller,
 * and while that happens the parent passes `progress` so each tile shows its
 * own upload state.
 *
 * The cap is one total for the item (`maxPhotos`), because the server stores
 * the photos of a request as one group.
 */

import { useRef } from 'react';
import Image from 'next/image';
import { AlertCircle, Check, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UploadProgressEntry } from '@/lib/uploads/client/upload-session-controller';
import {
  RETURN_PHOTO_ACCEPT,
  addPickedPhotos,
  getPickedPhoto,
  validateReturnPhoto,
} from '@/lib/uploads/return-photo-files';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  /** Keys of the picked photos, in display order. */
  photoKeys: string[];
  onChange: (photoKeys: string[]) => void;
  maxPhotos: number;
  /** Per-key upload state while the parent is submitting. */
  progress?: Record<string, UploadProgressEntry>;
  /** Locks picking and removing (e.g. while submitting). */
  disabled?: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoKeys,
  onChange,
  maxPhotos,
  progress,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const visibleKeys = photoKeys.filter((key) => getPickedPhoto(key));
  const full = visibleKeys.length >= maxPhotos;

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      const error = validateReturnPhoto(file);
      if (error) {
        toast.error(error);
        continue;
      }
      accepted.push(file);
    }

    const room = Math.max(0, maxPhotos - visibleKeys.length);
    if (accepted.length > room) {
      toast.error(`Up to ${maxPhotos} photo${maxPhotos === 1 ? '' : 's'}.`);
    }
    const toAdd = accepted.slice(0, room);
    if (toAdd.length === 0) return;
    // One onChange per selection, so a multi-select never loses files.
    onChange([...visibleKeys, ...addPickedPhotos(toAdd)]);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {visibleKeys.map((key, index) => {
          const photo = getPickedPhoto(key)!;
          const state = progress?.[key];
          return (
            <div
              key={key}
              className={cn(
                'relative h-20 w-20 overflow-hidden rounded-lg border bg-muted',
                state?.state === 'failed' ? 'border-red-400' : 'border-border'
              )}
            >
              <Image
                src={photo.previewUrl}
                alt={`Selected photo ${index + 1}`}
                fill
                sizes="80px"
                unoptimized
                className="object-cover"
              />
              {state &&
                (state.state === 'queued' || state.state === 'uploading') && (
                  <div className="absolute inset-0 flex items-end bg-black/40">
                    <div
                      className="h-1 bg-white transition-all"
                      style={{ width: `${state.percent}%` }}
                    />
                  </div>
                )}
              {state?.state === 'done' && (
                <span className="absolute bottom-1 right-1 rounded-full bg-emerald-600 p-0.5 text-white">
                  <Check size={10} />
                </span>
              )}
              {state?.state === 'failed' && (
                <span className="absolute bottom-1 right-1 rounded-full bg-red-600 p-0.5 text-white">
                  <AlertCircle size={10} />
                </span>
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(visibleKeys.filter((k) => k !== key))}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                  aria-label="Remove photo"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        {!full && !disabled && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
          >
            <ImagePlus size={18} />
            Add
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={RETURN_PHOTO_ACCEPT}
          multiple={maxPhotos > 1}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {visibleKeys.length}/{maxPhotos} photos · max 5 MB each
      </p>
    </div>
  );
};

export default PhotoUploader;
