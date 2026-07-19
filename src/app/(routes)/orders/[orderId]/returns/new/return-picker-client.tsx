'use client';

/**
 * ReturnPickerClient - the eligibility-driven item picker.
 *
 * Flat list of order items. Every item shows the same "Return / Exchange"
 * affordance (Amazon/Myntra style); ineligible items render the button
 * disabled with an inline reason instead of hiding it. Configured slices show
 * as editable chips under their item. A sticky basket footer appears once ≥1
 * slice is configured and routes to the review screen.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  ChevronLeft,
  ImageOff,
  Loader2,
  Pencil,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import Container from '@/components/ui/container';
import Currency from '@/components/ui/currency';
import OtpModal from '@/components/returns/otp-modal';
import { getEligibility, ReturnsApiError } from '@/lib/returns-api';
import type {
  EligibilityItem,
  EligibilityResponse,
  Resolution,
} from '@/lib/returns-types';
import useReturnBasket, { type BasketSlice } from '@/hooks/use-return-basket';
import useOrderSession from '@/hooks/use-order-session';

interface ReturnPickerClientProps {
  orderId: string;
}

const RESOLUTION_LABEL: Record<Resolution, string> = {
  REFUND: 'Refund',
  EXCHANGE: 'Exchange',
  REPLACEMENT: 'Replacement',
};

const ReturnPickerClient = ({ orderId }: ReturnPickerClientProps) => {
  const router = useRouter();
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(
    null
  );
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'auth'>(
    'loading'
  );

  const basket = useReturnBasket((s) => s.baskets[orderId] ?? null);
  const removeSlice = useReturnBasket((s) => s.removeSlice);
  const requestStepUp = useOrderSession((s) => s.requestStepUp);
  const slices = basket?.slices ?? [];

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setStatus('loading');
      try {
        const data = await getEligibility(orderId, signal);
        setEligibility(data);
        setStatus('ready');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ReturnsApiError && err.isAuthError) {
          setStatus('auth');
          return;
        }
        setStatus('error');
      }
    },
    [orderId]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (status === 'loading') {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Container>
    );
  }

  if (status === 'auth') {
    return (
      <Container>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-lg font-semibold">Verification needed</h1>
          <p className="text-sm text-muted-foreground">
            Please verify your identity to start a return.
          </p>
          <button
            type="button"
            onClick={() => requestStepUp({ type: 'START_RETURN' }, 'RETURN')}
            className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Verify to continue
          </button>
        </div>
        <OtpModal orderId={orderId} onVerified={() => void load()} />
      </Container>
    );
  }

  if (status === 'error' || !eligibility) {
    return (
      <Container>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-lg font-semibold">
            Couldn’t load return options
          </h1>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
          >
            Retry
          </button>
        </div>
      </Container>
    );
  }

  const configuredSlices = slices.filter((s) => s.configured);
  const maxSlices = eligibility.policy.maxBasketSlicesPerSubmission;
  const basketFull = configuredSlices.length >= maxSlices;

  return (
    <Container>
      <div className="mx-auto max-w-3xl py-6 pb-28">
        <button
          type="button"
          onClick={() => router.push(`/orders/${orderId}`)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft size={16} />
          Back to order
        </button>

        <h1 className="mt-4 text-lg font-semibold">Start a return</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select the items you’d like to return, exchange, or replace.
        </p>

        <div className="mt-6 space-y-4">
          {eligibility.items.map((item) => (
            <ItemPickerCard
              key={item.orderItemId}
              orderId={orderId}
              item={item}
              slicesForItem={slices.filter(
                (s) => s.orderItemId === item.orderItemId
              )}
              basketFull={basketFull}
              onConfigure={() =>
                router.push(
                  `/orders/${orderId}/returns/new/${item.orderItemId}`
                )
              }
              onEditSlice={(draftId) =>
                router.push(
                  `/orders/${orderId}/returns/new/${item.orderItemId}?slice=${draftId}`
                )
              }
              onRemoveSlice={(draftId) => removeSlice(orderId, draftId)}
              onFileComplaint={() =>
                router.push(
                  `/orders/${orderId}/returns/new/${item.orderItemId}?complaint=1`
                )
              }
            />
          ))}
        </div>
      </div>

      {configuredSlices.length > 0 && (
        <BasketFooter
          count={configuredSlices.length}
          onReview={() => router.push(`/orders/${orderId}/returns/new/review`)}
        />
      )}
    </Container>
  );
};

/* ------------------------------------------------------------------ */
/* Item card                                                           */
/* ------------------------------------------------------------------ */

interface ItemPickerCardProps {
  orderId: string;
  item: EligibilityItem;
  slicesForItem: BasketSlice[];
  basketFull: boolean;
  onConfigure: () => void;
  onEditSlice: (draftId: string) => void;
  onRemoveSlice: (draftId: string) => void;
  onFileComplaint: () => void;
}

const ItemPickerCard: React.FC<ItemPickerCardProps> = ({
  item,
  slicesForItem,
  basketFull,
  onConfigure,
  onEditSlice,
  onRemoveSlice,
  onFileComplaint,
}) => {
  const { snapshot, actionsAllowed } = item;
  const anyAllowed =
    actionsAllowed.REFUND.allowed ||
    actionsAllowed.EXCHANGE.allowed ||
    actionsAllowed.REPLACEMENT.allowed;

  const configuredCount = slicesForItem.filter((s) => s.configured).length;
  const qtyExhausted = configuredCount >= item.qtyAvailable;

  // Reason the item is not actionable (when applicable).
  const blockedReason = (() => {
    if (item.nonReturnable)
      return item.nonReturnableReason ?? 'This item is non-returnable.';
    if (!anyAllowed) {
      const windowEnd = actionsAllowed.REFUND.windowEndsAt;
      if (actionsAllowed.REFUND.reason === 'WINDOW_CLOSED' && windowEnd) {
        return `Return window ended on ${new Date(windowEnd).toLocaleDateString('en-IN')}.`;
      }
      return 'Return window closed.';
    }
    return null;
  })();

  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          {snapshot.imageUrl ? (
            <Image
              src={snapshot.imageUrl}
              alt={snapshot.productName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageOff size={18} />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {snapshot.productName}
          </p>
          {snapshot.variantLabel && (
            <p className="truncate text-xs text-muted-foreground">
              {snapshot.variantLabel}
            </p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">
            <Currency
              amount={snapshot.unitPrice}
              className="text-xs font-semibold"
            />{' '}
            · Qty {item.qtyOrdered}
          </p>

          {/* Configured slice chips */}
          {slicesForItem
            .filter((s) => s.configured)
            .map((slice, idx) => (
              <div
                key={slice.draftId}
                className="mt-2 flex items-center gap-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs"
              >
                <span className="flex-1 text-foreground">
                  ✓ {RESOLUTION_LABEL[slice.resolution]} × {slice.quantity}
                  {slice.photos.length > 0 && (
                    <span className="ml-1 inline-flex items-center gap-0.5 text-muted-foreground">
                      <Camera size={11} /> {slice.photos.length}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => onEditSlice(slice.draftId)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={`Edit selection ${idx + 1}`}
                >
                  <Pencil size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveSlice(slice.draftId)}
                  className="text-muted-foreground hover:text-red-500"
                  aria-label={`Remove selection ${idx + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Action row */}
      <div className="mt-3">
        {blockedReason ? (
          <>
            <p className="text-xs text-muted-foreground">{blockedReason}</p>
            {item.nonReturnable && (
              <button
                type="button"
                onClick={onFileComplaint}
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ShieldAlert size={13} />
                Damaged or not as described? File a complaint
              </button>
            )}
          </>
        ) : qtyExhausted ? (
          <p className="text-xs text-muted-foreground">
            All available units selected.
          </p>
        ) : (
          <button
            type="button"
            onClick={onConfigure}
            disabled={basketFull}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-foreground transition hover:border-primary disabled:opacity-50"
          >
            {configuredCount > 0
              ? 'Add another'
              : 'Return / Exchange / Replace'}
            <ArrowRight size={14} />
          </button>
        )}
        {basketFull && !blockedReason && !qtyExhausted && (
          <p className="mt-1 text-xs text-muted-foreground">
            Basket limit reached.
          </p>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sticky basket footer                                                */
/* ------------------------------------------------------------------ */

const BasketFooter: React.FC<{ count: number; onReview: () => void }> = ({
  count,
  onReview,
}) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
    <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <p className="text-sm text-foreground">
        <span className="font-semibold">{count}</span> item
        {count === 1 ? '' : 's'} selected
        <span className="ml-1 text-xs text-muted-foreground">
          · amounts estimated at review
        </span>
      </p>
      <button
        type="button"
        onClick={onReview}
        className="btn-press inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Review
        <ArrowRight size={15} />
      </button>
    </div>
  </div>
);

export default ReturnPickerClient;
