'use client';

/**
 * SettlementBreakdown — renders the authoritative post-submit settlement
 * returned by POST /returns.
 *
 * The server is law: every number here comes straight from `settlement` and the
 * `submitted[]` cards. Reverse-shipping-fee rows render ONLY when the per-slice
 * `netReverseShippingFeeInr > "0.00"`. Refund figures are always labelled
 * "Estimated". This component never opens Razorpay itself — the parent decides
 * what to do with `onPay`.
 */

import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import Currency from '@/components/ui/currency';
import type { Settlement, SubmittedSlice } from '@/lib/returns-types';

interface SettlementBreakdownProps {
  submitted: SubmittedSlice[];
  settlement: Settlement;
  onPay: () => void;
  onDone: () => void;
  payDisabled?: boolean;
}

const gt0 = (v: string | null | undefined) => v != null && Number(v) > 0;

const SettlementBreakdown: React.FC<SettlementBreakdownProps> = ({
  submitted,
  settlement,
  onPay,
  onDone,
  payDisabled,
}) => {
  const hasFallback = submitted.some((s) => s.softFallbackApplied);

  return (
    <div className="space-y-6">
      {hasFallback && (
        <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Some items went out of stock during submission and were converted to a
          refund.
        </div>
      )}

      {/* Per-slice line cards */}
      <div className="space-y-3">
        {submitted.map((slice) => (
          <SliceCard
            key={`${slice.returnNumber}-${slice.sliceIndex}`}
            slice={slice}
          />
        ))}
      </div>

      {/* Settlement summary */}
      <div className="rounded-2xl border border-border p-4">
        {settlement.outcome === 'PAYMENT_DUE' && (
          <div className="space-y-1.5 text-sm">
            <Row
              label="Amount payable"
              value={settlement.diffPayableInr}
              strong
            />
            {gt0(settlement.reverseShippingFeeChargedInr) && (
              <Row
                label="Reverse shipping fee"
                value={settlement.reverseShippingFeeChargedInr}
              />
            )}
            {settlement.waiverApplied && gt0(settlement.waivedInr) && (
              <Row
                label="Waiver applied"
                value={`-${settlement.waivedInr}`}
                muted
              />
            )}
            <div className="mt-2 border-t border-border pt-2">
              <Row label="Total to pay" value={settlement.payableInr} strong />
            </div>
            {gt0(settlement.refundDueInr) && (
              <p className="mt-2 text-xs text-muted-foreground">
                You’ll also receive an estimated refund of{' '}
                <Currency
                  amount={settlement.estimatedRefundTotalInr}
                  className="text-xs font-semibold"
                />{' '}
                after pickup &amp; QC.
              </p>
            )}
          </div>
        )}

        {settlement.outcome === 'REFUND_DUE' && (
          <div className="space-y-1.5 text-sm">
            <Row label="Estimated refund" value={settlement.refundDueInr} />
            {gt0(settlement.reverseShippingFeeFromRefundInr) && (
              <Row
                label="Reverse shipping fee"
                value={`-${settlement.reverseShippingFeeFromRefundInr}`}
                muted
              />
            )}
            <div className="mt-2 border-t border-border pt-2">
              <Row
                label="Estimated total refund"
                value={settlement.estimatedRefundTotalInr}
                strong
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <Currency
                amount={settlement.estimatedRefundTotalInr}
                className="text-xs font-semibold"
              />{' '}
              credited to{' '}
              {settlement.refundTargetMasked ?? 'your original payment method'}{' '}
              after pickup &amp; QC (5–7 business days).
            </p>
          </div>
        )}

        {settlement.outcome === 'EVEN' && (
          <p className="text-sm text-foreground">
            Submitted — no payment needed.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        {settlement.outcome === 'PAYMENT_DUE' ? (
          <button
            type="button"
            onClick={onPay}
            disabled={payDisabled}
            className="btn-press rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Proceed to pay{' '}
            <Currency
              amount={settlement.payableInr}
              className="text-sm font-semibold text-primary-foreground"
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={onDone}
            className="btn-press rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const SliceCard: React.FC<{ slice: SubmittedSlice }> = ({ slice }) => {
  const showReverseFee = gt0(slice.netReverseShippingFeeInr);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border p-3">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {slice.imageUrl ? (
          <Image
            src={slice.imageUrl}
            alt={slice.productName}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff size={16} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {slice.productName}
        </p>
        {slice.variantLabel && (
          <p className="truncate text-xs text-muted-foreground">
            {slice.variantLabel}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Qty {slice.quantity} · #{slice.returnNumber}
        </p>
        {slice.softFallbackApplied && (
          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
            Converted to refund (out of stock)
          </span>
        )}
      </div>

      <div className="text-right text-xs">
        {slice.kind === 'PAY' && gt0(slice.priceDifferenceInr) && (
          <span className="font-medium text-foreground">
            +
            <Currency
              amount={slice.priceDifferenceInr}
              className="text-xs font-medium"
            />
          </span>
        )}
        {slice.kind === 'REFUND' && (
          <span className="text-muted-foreground">
            Est.{' '}
            <Currency
              amount={slice.estimatedRefundInr ?? '0'}
              className="text-xs font-medium"
            />
          </span>
        )}
        {slice.kind === 'EVEN' && (
          <span className="text-muted-foreground">No difference</span>
        )}
        {slice.kind === 'REPLACEMENT' && (
          <span className="text-muted-foreground">Replacement</span>
        )}
        {showReverseFee && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Reverse fee{' '}
            <Currency
              amount={slice.netReverseShippingFeeInr}
              className="text-[11px]"
            />
          </p>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}> = ({ label, value, strong, muted }) => (
  <div className="flex items-center justify-between">
    <span className={muted ? 'text-muted-foreground' : 'text-foreground'}>
      {label}
    </span>
    <Currency
      amount={value.replace('-', '')}
      className={`text-sm ${strong ? 'font-semibold' : 'font-normal'} ${muted ? 'text-muted-foreground' : ''}`}
    />
  </div>
);

export default SettlementBreakdown;
