'use client';

/**
 * VariantPicker — Step 4 of the per-item configurator (EXCHANGE / REPLACEMENT).
 *
 * Fetches `/returns/exchange-options` for the chosen reason + intent. For
 * REPLACEMENT the server returns just the original variant → a single confirm
 * card. For EXCHANGE it returns a pre-filtered variant list with signed
 * `priceDiffInr` and stock; OOS rows are disabled. The applied-filter copy and
 * "Show all sizes" affordance are driven off `appliedFilter`. When all variants
 * are OOS and the reason allows it, an offer to switch to Refund is surfaced.
 */

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Loader2 } from 'lucide-react';
import Currency from '@/components/ui/currency';
import { cn } from '@/lib/utils';
import { getExchangeOptions, ReturnsApiError } from '@/lib/returns-api';
import type { ExchangeOptionsResponse, ExchangeVariant } from '@/lib/returns-types';

interface VariantPickerProps {
  orderId: string;
  orderItemId: string;
  reasonConfigId: string;
  reasonDetailedId: string | null;
  intent: 'EXCHANGE' | 'REPLACEMENT';
  selectedVariantId: string | null;
  onSelect: (variant: ExchangeVariant, newProductId: string) => void;
  onSwitchToRefund: () => void;
}

const FILTER_COPY: Record<string, string> = {
  LARGER_SIZES: 'Showing larger sizes only.',
  SMALLER_SIZES: 'Showing smaller sizes only.',
  SAME_VARIANT_DIFFERENT_UNIT: 'Showing the same variant.',
  ALL_SIZES: 'Showing all sizes.',
};

const VariantPicker: React.FC<VariantPickerProps> = ({
  orderId,
  orderItemId,
  reasonConfigId,
  reasonDetailedId,
  intent,
  selectedVariantId,
  onSelect,
  onSwitchToRefund,
}) => {
  const [data, setData] = useState<ExchangeOptionsResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setStatus('loading');
      try {
        const res = await getExchangeOptions(
          orderId,
          { orderItemId, reasonConfigId, reasonDetailedId, intent },
          signal,
        );
        setData(res);
        setStatus('ready');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ReturnsApiError) {
          setStatus('error');
          return;
        }
        setStatus('error');
      }
    },
    [orderId, orderItemId, reasonConfigId, reasonDetailedId, intent],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (status === 'loading') {
    return (
      <div className="flex h-28 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (status === 'error' || !data) {
    return (
      <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        Couldn’t load options.{' '}
        <button type="button" onClick={() => void load()} className="font-semibold text-primary">
          Retry
        </button>
      </div>
    );
  }

  const allOutOfStock = data.variants.length > 0 && data.variants.every((v) => !v.inStock);
  const offerRefundFallback = data.suggestedFallbackResolution === 'REFUND' && allOutOfStock;

  // REPLACEMENT → single confirm card.
  if (intent === 'REPLACEMENT') {
    const variant = data.variants[0];
    return (
      <div className="space-y-3">
        {variant ? (
          <button
            type="button"
            onClick={() => onSelect(variant, data.productId)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition',
              selectedVariantId === variant.variantId
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary',
            )}
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
              {variant.imageUrl && (
                <Image src={variant.imageUrl} alt={variant.label} fill sizes="56px" className="object-cover" />
              )}
            </div>
            <span className="flex-1">
              <span className="block text-sm font-medium text-foreground">
                Send me a non-defective unit
              </span>
              <span className="block text-xs text-muted-foreground">{variant.label}</span>
            </span>
            <ArrowRight size={16} className="text-muted-foreground" />
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">No replacement unit is available right now.</p>
        )}
        {offerRefundFallback && (
          <RefundFallbackBanner hint={data.fallbackEducationHint} onSwitch={onSwitchToRefund} />
        )}
      </div>
    );
  }

  // EXCHANGE → filtered variant list.
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {FILTER_COPY[data.appliedFilter] ?? 'Choose a variant to exchange for.'}
        </p>
        {!showAll && data.appliedFilter !== 'ALL_SIZES' && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-xs font-semibold text-primary"
          >
            Show all sizes
          </button>
        )}
      </div>

      <div className="space-y-2">
        {data.variants.map((variant) => {
          const disabled = !variant.inStock;
          const diff = Number(variant.priceDiffInr);
          return (
            <button
              key={variant.variantId}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(variant, data.productId)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition',
                disabled && 'cursor-not-allowed opacity-50',
                selectedVariantId === variant.variantId
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary',
              )}
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {variant.imageUrl && (
                  <Image src={variant.imageUrl} alt={variant.label} fill sizes="48px" className="object-cover" />
                )}
              </div>
              <span className="flex-1">
                <span className="block text-sm font-medium text-foreground">{variant.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {disabled ? 'Out of stock' : `${variant.stock} in stock`}
                </span>
              </span>
              <span className="text-right text-xs">
                {diff === 0 ? (
                  <span className="text-muted-foreground">No price difference</span>
                ) : diff > 0 ? (
                  <span className="font-medium text-foreground">
                    +<Currency amount={variant.priceDiffInr} className="text-xs font-medium" />
                  </span>
                ) : (
                  <span className="font-medium text-green-700">
                    −<Currency amount={Math.abs(diff)} className="text-xs font-medium text-green-700" />
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {offerRefundFallback ? (
        <RefundFallbackBanner hint={data.fallbackEducationHint} onSwitch={onSwitchToRefund} />
      ) : (
        allOutOfStock && (
          <p className="rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            No variants in stock — pick a different sub-reason or change the resolution.
          </p>
        )
      )}
    </div>
  );
};

const RefundFallbackBanner: React.FC<{ hint: string | null; onSwitch: () => void }> = ({
  hint,
  onSwitch,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 p-3">
    <p className="text-xs text-amber-800">
      {hint ?? 'Your chosen options are out of stock. Switch to a refund instead?'}
    </p>
    <button
      type="button"
      onClick={onSwitch}
      className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white"
    >
      Switch to Refund
    </button>
  </div>
);

export default VariantPicker;
