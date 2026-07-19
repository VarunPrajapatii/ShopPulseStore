'use client';

/**
 * ReasonPicker — Step 1 of the per-item configurator (reason-first).
 *
 * Renders `reasons[]` in `sortOrder`. Protected reasons (`isSystemProtected`)
 * get a 🔒 badge. Selecting a reason sets `reasonConfigId` and seeds the
 * resolution from `defaultResolution ?? availableResolutions[0]`. Nested
 * `detailedReasons[]` render as a second-level radio (the active one's
 * `variantFilterHint` drives the variant picker). Resolution chips render only
 * when more than one resolution is available. Free-text shows when the reason
 * requires detail.
 *
 * This is a controlled component: it reads the current slice fields and reports
 * changes upward; it never computes eligibility.
 */

import { Lock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReasonConfig, Resolution } from '@/lib/returns-types';

const RESOLUTION_LABEL: Record<Resolution, string> = {
  REFUND: 'Refund',
  EXCHANGE: 'Exchange',
  REPLACEMENT: 'Replacement',
};

interface ReasonPickerProps {
  reasons: ReasonConfig[];
  reasonConfigId: string | null;
  reasonDetailedId: string | null;
  resolution: Resolution;
  reasonText: string | null;
  onReasonChange: (reason: ReasonConfig) => void;
  onDetailedChange: (detailedId: string) => void;
  onResolutionChange: (resolution: Resolution) => void;
  onReasonTextChange: (text: string) => void;
}

const ReasonPicker: React.FC<ReasonPickerProps> = ({
  reasons,
  reasonConfigId,
  reasonDetailedId,
  resolution,
  reasonText,
  onReasonChange,
  onDetailedChange,
  onResolutionChange,
  onReasonTextChange,
}) => {
  const selected = reasons.find((r) => r.reasonConfigId === reasonConfigId) ?? null;
  const sorted = [...reasons].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-3">
      {sorted.map((reason) => {
        const isSelected = reason.reasonConfigId === reasonConfigId;
        return (
          <div
            key={reason.reasonConfigId}
            className={cn(
              'rounded-xl border transition',
              isSelected ? 'border-primary bg-primary/5' : 'border-border',
            )}
          >
            <label className="flex cursor-pointer items-start gap-3 p-4">
              <input
                type="radio"
                name="reason"
                checked={isSelected}
                onChange={() => onReasonChange(reason)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span className="flex-1">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  {reason.label}
                  {reason.isSystemProtected && (
                    <span
                      title="Required by law to display."
                      className="inline-flex items-center"
                    >
                      <Lock size={12} className="text-muted-foreground" />
                    </span>
                  )}
                </span>
                {reason.customerEducationHint && isSelected && (
                  <span className="mt-2 flex items-start gap-1.5 rounded-lg bg-blue-50 p-2 text-xs text-blue-700">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    {reason.customerEducationHint}
                  </span>
                )}
              </span>
            </label>

            {/* Second-level detailed reasons */}
            {isSelected && reason.detailedReasons && reason.detailedReasons.length > 0 && (
              <div className="space-y-1.5 border-t border-border px-4 py-3 pl-11">
                {reason.detailedReasons
                  .filter((d) => d.isActive)
                  .map((detailed) => (
                    <label
                      key={detailed.reasonDetailedId}
                      className="flex cursor-pointer items-center gap-2.5 text-sm"
                    >
                      <input
                        type="radio"
                        name="detailed-reason"
                        checked={reasonDetailedId === detailed.reasonDetailedId}
                        onChange={() => onDetailedChange(detailed.reasonDetailedId)}
                        className="h-3.5 w-3.5 accent-primary"
                      />
                      <span className="text-muted-foreground">{detailed.label}</span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Resolution chips — only when more than one is available */}
      {selected && selected.availableResolutions.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">How would you like to resolve this?</p>
          <div className="flex flex-wrap gap-2">
            {(['REFUND', 'EXCHANGE', 'REPLACEMENT'] as Resolution[]).map((res) => {
              const available = selected.availableResolutions.includes(res);
              if (!available) return null;
              return (
                <button
                  key={res}
                  type="button"
                  onClick={() => onResolutionChange(res)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                    resolution === res
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-foreground hover:border-primary',
                  )}
                >
                  {RESOLUTION_LABEL[res]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Free-text — when the reason requires detail */}
      {selected?.requiresDetail && (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Tell us a bit more
          </label>
          <textarea
            value={reasonText ?? ''}
            onChange={(e) => onReasonTextChange(e.target.value.slice(0, 2000))}
            rows={3}
            maxLength={2000}
            placeholder="Describe the issue…"
            className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      )}
    </div>
  );
};

export default ReasonPicker;
