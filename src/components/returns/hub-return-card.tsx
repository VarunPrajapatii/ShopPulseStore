'use client';

/**
 * HubReturnCard — one return / exchange / replacement tracking entry.
 *
 * Money rules honoured: `expectedRefundInr` is a GROSS estimate, always shown
 * with an "Estimated" qualifier. A `pendingPayment` (exchange difference not yet
 * paid) surfaces a "Complete payment" CTA. Cancel renders strictly off
 * `canCancel`. Detail opens the slide-over.
 */

import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import Currency from '@/components/ui/currency';
import StatusBadge from '@/components/returns/status-badge';
import type { HubReturn } from '@/lib/returns-types';

interface HubReturnCardProps {
  item: HubReturn;
  onViewDetail: (returnNumber: string) => void;
  onCancel: (returnNumber: string) => void;
  onPayDifference: (returnNumber: string) => void;
}

const RESOLUTION_LABEL: Record<HubReturn['resolution'], string> = {
  REFUND: 'Refund',
  EXCHANGE: 'Exchange',
  REPLACEMENT: 'Replacement',
};

function formatDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const HubReturnCard: React.FC<HubReturnCardProps> = ({
  item,
  onViewDetail,
  onCancel,
  onPayDifference,
}) => {
  const submitted = formatDate(item.submittedAt);
  const snap = item.productSnapshot;

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {RESOLUTION_LABEL[item.resolution]} · {item.returnNumber}
          </span>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <div className="mt-3 flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {snap.imageUrl ? (
            <Image
              src={snap.imageUrl}
              alt={snap.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {snap.name}
          </p>
          {snap.variantLabel && (
            <p className="text-xs text-muted-foreground">{snap.variantLabel}</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            Qty {item.quantity}
            {submitted && ` · Requested ${submitted}`}
          </p>
          {item.expectedRefundInr && Number(item.expectedRefundInr) > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Estimated refund{' '}
              <Currency
                amount={item.expectedRefundInr}
                className="text-xs font-semibold"
              />
              {item.expectedRefundTargetMasked &&
                ` → ${item.expectedRefundTargetMasked}`}
            </p>
          )}
        </div>
      </div>

      {item.pendingPayment && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            Payment of{' '}
            <Currency
              amount={item.pendingPayment.amountInr}
              className="text-xs font-semibold text-amber-900"
            />{' '}
            pending to confirm this exchange.
          </p>
          <button
            type="button"
            onClick={() => onPayDifference(item.returnNumber)}
            className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white"
          >
            Complete payment
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3">
        {item.canCancel && (
          <button
            type="button"
            onClick={() => onCancel(item.returnNumber)}
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={() => onViewDetail(item.returnNumber)}
          className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary"
        >
          View details
        </button>
      </div>
    </div>
  );
};

export default HubReturnCard;
