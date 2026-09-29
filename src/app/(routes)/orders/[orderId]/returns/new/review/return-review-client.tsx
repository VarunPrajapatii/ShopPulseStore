'use client';

/**
 * ReturnReviewClient - pre-submit review + post-submit settlement screen.
 * Reads the basket, lets the customer pick a
 * refund destination and accept the policy, then submits with the basket's
 * stable `submissionId` (idempotent via X-Submission-Id).
 *
 * On the authoritative submit response it renders <SettlementBreakdown />.
 * Razorpay is opened ONLY when the user clicks "Proceed to pay" for a
 * PAYMENT_DUE outcome — never automatically.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ImageOff, Loader2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import Container from '@/components/ui/container';
import Currency from '@/components/ui/currency';
import RefundTargetSelector from '@/components/returns/refund-target-selector';
import SettlementBreakdown from '@/components/returns/settlement-breakdown';
import OtpModal from '@/components/returns/otp-modal';
import {
  getEligibility,
  getRefundTarget,
  ReturnsApiError,
  submitReturns,
  verifyExchangeDiffPayment,
} from '@/lib/returns-api';
import type {
  RefundTargetInput,
  RefundTargetResponse,
  Settlement,
  SubmitBody,
  SubmitSlice,
  SubmittedSlice,
} from '@/lib/returns-types';
import useReturnBasket from '@/hooks/use-return-basket';
import useOrderSession from '@/hooks/use-order-session';
import { useRazorpay } from '@/hooks/use-razorpay';

interface ReturnReviewClientProps {
  orderId: string;
}

/** sessionStorage key the hub reads to surface OOS → refund conversions. */
const FALLBACK_NOTICE_KEY = 'return-submit-fallback';

const RESOLUTION_LABEL: Record<SubmitSlice['resolution'], string> = {
  REFUND: 'Refund',
  EXCHANGE: 'Exchange',
  REPLACEMENT: 'Replacement',
};

interface SubmitErrorDetails {
  sliceIndex?: number;
  field?: string;
  recoverable?: boolean;
  refreshRequired?: boolean;
}

function readSubmitErrorDetails(value: unknown): SubmitErrorDetails | null {
  if (!value || typeof value !== 'object') return null;
  const details = value as Record<string, unknown>;
  return {
    sliceIndex:
      typeof details.sliceIndex === 'number' ? details.sliceIndex : undefined,
    field: typeof details.field === 'string' ? details.field : undefined,
    recoverable:
      typeof details.recoverable === 'boolean'
        ? details.recoverable
        : undefined,
    refreshRequired:
      typeof details.refreshRequired === 'boolean'
        ? details.refreshRequired
        : undefined,
  };
}

const SUBMIT_ERROR_COPY: Record<string, string> = {
  REFUND_TARGET_REQUIRED: 'Please add refund details to continue.',
  COD_METHOD_MISMATCH: 'Please re-enter your refund details.',
  EXCHANGE_VARIANT_OUT_OF_STOCK:
    'Your chosen exchange variant just went out of stock. Please re-select.',
  RESOLUTION_OUT_OF_STOCK:
    'Your chosen option just went out of stock. Please re-select.',
  PHOTOS_REQUIRED: 'This store needs a photo of the item. Please add one.',
  REASON_PHOTOS_REQUIRED: 'This reason needs photos. Please add at least one.',
  REASON_DETAIL_REQUIRED: 'Please pick a specific sub-reason.',
  REASON_FREE_TEXT_REQUIRED: 'Please tell us a bit more.',
  EXCHANGE_CHOICE_REQUIRED: 'Please pick a variant for the exchange.',
  RESOLUTION_NOT_ALLOWED:
    'That action isn’t available for this item. Please pick another option.',
  REASON_RESOLUTION_NOT_PERMITTED:
    'That option is no longer available for the reason you picked.',
  REASON_INACTIVE: 'That reason is no longer offered. Please pick another.',
  REASON_NOT_FOUND: 'That reason is no longer offered. Please pick another.',
  DETAILED_REASON_INACTIVE:
    'That sub-reason is no longer offered. Please pick another.',
  DETAILED_REASON_NOT_IN_PARENT:
    'That sub-reason is no longer offered. Please pick another.',
  REASON_BLOCKED_BY_NONRETURNABLE:
    'This item can’t be returned for that reason. Try “Report a problem”.',
  PHOTO_QUOTA_EXCEEDED: 'Too many photos for an item. Remove a few and retry.',
  UNTRUSTED_EVIDENCE_IMAGE:
    'We couldn’t verify one of your photos. Please remove it and upload again.',
  SLICE_QUANTITY_EXCEEDED:
    'You’ve already requested that many units. Please lower the quantity.',
  BASKET_TOO_LARGE:
    'This store limits how many items one request can cover. Please remove a few.',
  ORDER_NOT_DELIVERED:
    'This order isn’t marked delivered yet, so it can’t be returned.',
  ORDER_CANCELLED: 'This order was cancelled, so it can’t be returned.',
  RETURNS_NOT_CONFIGURED:
    'This store isn’t accepting returns right now. Please contact support.',
  INVALID_BODY:
    'Something looks off with your selections. Please review and retry.',
  TEMPORARY: 'Something went wrong on our side. Please try again.',
};

const ReturnReviewClient = ({ orderId }: ReturnReviewClientProps) => {
  const router = useRouter();
  const basket = useReturnBasket((s) => s.baskets[orderId] ?? null);
  const setBasketRefundTarget = useReturnBasket((s) => s.setRefundTarget);
  const setPolicyAccepted = useReturnBasket((s) => s.setPolicyAccepted);
  const updateSlice = useReturnBasket((s) => s.updateSlice);
  const clearBasket = useReturnBasket((s) => s.clearBasket);
  const requestStepUp = useOrderSession((s) => s.requestStepUp);
  const getRemainingSessionMs = useOrderSession((s) => s.getRemainingSessionMs);

  const razorpay = useRazorpay();

  const [hydrated, setHydrated] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState<RefundTargetResponse | null>(
    null
  );
  const [refundTarget, setRefundTarget] = useState<RefundTargetInput | null>(
    null
  );
  const [policyChecked, setPolicyChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storePolicy, setStorePolicy] = useState<{
    text: string | null;
    url: string | null;
  } | null>(null);
  const [policyTextOpen, setPolicyTextOpen] = useState(false);

  const [result, setResult] = useState<{
    submitted: SubmittedSlice[];
    settlement: Settlement;
  } | null>(null);
  const [paying, setPaying] = useState(false);

  /**
   * Set while the submit-error handler is routing the customer back to a
   * specific item. It suppresses the empty-basket guard below, which would
   * otherwise fire on the same render (the slice is marked unconfigured) and
   * bounce them to the picker with no explanation.
   */
  const recoveringRef = useRef(false);

  useEffect(() => setHydrated(true), []);

  const configuredSlices = (basket?.slices ?? []).filter((s) => s.configured);

  // A destination is only collected when money actually flows back now. This
  // mirrors the server rule, so a pure exchange/replacement basket is never
  // blocked behind bank details it will not use.
  const needsRefundDestination = configuredSlices.some(
    (s) => s.resolution === 'REFUND'
  );
  const refundTargetReady =
    !needsRefundDestination || refundPolicy === null || refundTarget !== null;

  // Empty-basket guard (only before a submit result exists).
  useEffect(() => {
    if (recoveringRef.current) return;
    if (hydrated && !result && configuredSlices.length === 0) {
      router.replace(`/orders/${orderId}/returns/new`);
    }
  }, [hydrated, result, configuredSlices.length, orderId, router]);

  // Lazily load the refund-target policy on mount.
  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    getRefundTarget(orderId, controller.signal)
      .then((res) => {
        setRefundPolicy(res);
        if (res.savedRefundTarget?.type === 'ORIGINAL') {
          setRefundTarget({ type: 'ORIGINAL' });
        }
      })
      .catch(() => {
        /* refund-target is optional context; submit still validates server-side */
      });
    return () => controller.abort();
  }, [hydrated, orderId]);

  // The policy the customer is about to accept must be readable here.
  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    getEligibility(orderId, controller.signal)
      .then((res) =>
        setStorePolicy({
          text: res.policy.returnsPolicyText,
          url: res.policy.returnsPolicyUrl,
        })
      )
      .catch(() => {
        /* policy copy is presentational; absence falls back to plain wording */
      });
    return () => controller.abort();
  }, [hydrated, orderId]);

  const handleSubmit = useCallback(async () => {
    if (!basket || configuredSlices.length === 0) return;
    if (!policyChecked) {
      toast.error('Please accept the return policy to continue.');
      return;
    }
    if (!refundTargetReady) {
      toast.error('Please complete your refund details to continue.');
      return;
    }

    const remainingSessionMs = getRemainingSessionMs();
    if (remainingSessionMs !== null && remainingSessionMs <= 0) {
      toast.error('Your session has expired. Please verify again.');
      requestStepUp({ type: 'START_RETURN' }, 'RETURN');
      return;
    }
    if (remainingSessionMs !== null && remainingSessionMs < 5 * 60 * 1000) {
      toast('Your session will expire soon. Please complete your action.');
    }

    const slices: SubmitSlice[] = configuredSlices.map((s) => ({
      orderItemId: s.orderItemId,
      quantity: s.quantity,
      resolution: s.resolution,
      reasonConfigId: s.reasonConfigId ?? '',
      reasonDetailedId: s.reasonDetailedId ?? undefined,
      reasonText: s.reasonText ?? undefined,
      photos: s.photos.length > 0 ? s.photos : undefined,
      exchangeChoice: s.exchangeChoice ?? undefined,
    }));

    const body: SubmitBody = {
      slices,
      refundTarget: refundTarget ?? undefined,
    };

    setSubmitting(true);
    setBasketRefundTarget(orderId, refundTarget);
    setPolicyAccepted(orderId, true);

    try {
      const res = await submitReturns(orderId, basket.submissionId, body);
      setResult({ submitted: res.submitted, settlement: res.settlement });
    } catch (err) {
      if (err instanceof ReturnsApiError) {
        if (err.isAuthError) {
          // Mid-flow session expiry: keep the basket (sessionStorage) and reopen
          // the OTP step-up. Submitting again resumes once verified.
          toast.error('Please verify again to submit your return.');
          requestStepUp({ type: 'START_RETURN' }, 'RETURN');
          return;
        }
        const details = readSubmitErrorDetails(err.details);
        const affectedSlice =
          details?.sliceIndex !== undefined
            ? configuredSlices[details.sliceIndex]
            : null;
        if (details?.recoverable && affectedSlice) {
          recoveringRef.current = true;
          const patch: Parameters<typeof updateSlice>[2] = {
            configured: false,
          };
          if (details.field === 'reasonConfigId') {
            patch.reasonConfigId = null;
            patch.reasonDetailedId = null;
            patch.reasonLabel = null;
            patch.detailedReasonLabel = null;
            patch.exchangeChoice = null;
          } else if (details.field === 'reasonDetailedId') {
            patch.reasonDetailedId = null;
            patch.detailedReasonLabel = null;
          } else if (details.field === 'resolution') {
            patch.exchangeChoice = null;
          }
          updateSlice(orderId, affectedSlice.draftId, patch);

          toast.error(
            SUBMIT_ERROR_COPY[err.code] ??
              'One item needs another look before we can submit.'
          );

          const query = new URLSearchParams({
            slice: affectedSlice.draftId,
            issue: err.code,
          });
          if (affectedSlice.lane === 'PROTECTED') {
            query.set('complaint', '1');
          }
          router.replace(
            `/orders/${orderId}/returns/new/${affectedSlice.orderItemId}?${query.toString()}`
          );
          return;
        }
        toast.error(
          SUBMIT_ERROR_COPY[err.code] ??
            'Couldn’t submit your return. Please retry.'
        );
      } else {
        toast.error('Couldn’t submit your return. Please retry.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    basket,
    configuredSlices,
    refundTargetReady,
    policyChecked,
    refundTarget,
    orderId,
    getRemainingSessionMs,
    requestStepUp,
    setBasketRefundTarget,
    setPolicyAccepted,
    updateSlice,
    router,
  ]);

  const finishToHub = useCallback(() => {
    // Hand off fallback conversions so the hub can show a thank-you banner.
    if (result) {
      const notices = result.submitted
        .filter((s) => s.softFallbackApplied)
        .map((s) => ({
          productName: s.productName,
          variantLabel: s.variantLabel,
          estimatedRefundInr: s.estimatedRefundInr,
        }));
      if (notices.length > 0) {
        try {
          sessionStorage.setItem(FALLBACK_NOTICE_KEY, JSON.stringify(notices));
        } catch {
          /* non-fatal */
        }
      }
    }
    clearBasket(orderId);
    router.push(`/orders/${orderId}?just=submitted`);
  }, [result, clearBasket, orderId, router]);

  const handlePay = useCallback(() => {
    if (!result) return;
    const { settlement, submitted } = result;
    if (!settlement.razorpayOrderId) {
      toast.error(
        'Payment isn’t available right now. You can retry from your order page.'
      );
      router.push(`/orders/${orderId}`);
      return;
    }
    if (!razorpay.isReady) {
      toast.error('Payment is still loading. Please try again in a moment.');
      return;
    }

    setPaying(true);
    try {
      razorpay.open({
        keyId: settlement.keyId,
        razorpayOrderId: settlement.razorpayOrderId,
        amountPaise: Math.round(Number(settlement.payableInr) * 100),
        name: 'Return payment',
        description: 'Exchange difference',
        prefill: settlement.prefill,
        onSuccess: async (response) => {
          try {
            // Any one returnNumber settles the whole basket (server fans out).
            const anyReturn = submitted[0]?.returnNumber;
            if (anyReturn) {
              await verifyExchangeDiffPayment(orderId, anyReturn, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
            }
            toast.success('Payment successful');
            finishToHub();
          } catch {
            toast.error(
              'We couldn’t confirm the payment. Check your order page shortly.'
            );
            router.push(`/orders/${orderId}`);
          }
        },
        onDismiss: () => {
          setPaying(false);
          toast('Payment cancelled — you can resume from your order page.');
          router.push(`/orders/${orderId}`);
        },
      });
    } catch {
      setPaying(false);
      toast.error(
        'Couldn’t start the payment. Please retry from your order page.'
      );
    }
  }, [result, razorpay, orderId, router, finishToHub]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!hydrated || (!result && configuredSlices.length === 0)) {
    return (
      <Container>
        <div className="min-h-[40vh]" />
      </Container>
    );
  }

  // Post-submit settlement screen.
  if (result) {
    return (
      <Container>
        <div className="mx-auto max-w-2xl py-6">
          <h1 className="text-lg font-semibold">Your request was submitted</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here’s the summary. Refund amounts are estimated and confirmed after
            pickup &amp; QC.
          </p>
          <div className="mt-6">
            <SettlementBreakdown
              submitted={result.submitted}
              settlement={result.settlement}
              onPay={handlePay}
              onDone={finishToHub}
              payDisabled={paying}
            />
          </div>
        </div>
      </Container>
    );
  }

  // Pre-submit review.
  return (
    <Container>
      <div className="mx-auto max-w-2xl py-6">
        <button
          type="button"
          onClick={() => router.push(`/orders/${orderId}/returns/new`)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ChevronLeft size={16} />
          Back to items
        </button>

        <h1 className="mt-4 text-lg font-semibold">Review your return</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {configuredSlices.length} item(s) selected
        </p>

        {/* Slice summary */}
        <div className="mt-6 space-y-3">
          {configuredSlices.map((slice) => (
            <div
              key={slice.draftId}
              className="flex items-start gap-3 rounded-xl border border-border p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {slice.snapshot.imageUrl ? (
                  <Image
                    src={slice.snapshot.imageUrl}
                    alt={slice.snapshot.productName}
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
                  {slice.snapshot.productName}
                </p>
                {slice.snapshot.variantLabel && (
                  <p className="truncate text-xs text-muted-foreground">
                    {slice.snapshot.variantLabel}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {RESOLUTION_LABEL[slice.resolution]} × {slice.quantity}
                </p>
                {slice.reasonLabel && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {slice.reasonLabel}
                    {slice.detailedReasonLabel
                      ? ` · ${slice.detailedReasonLabel}`
                      : ''}
                  </p>
                )}
                {slice.photos.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {slice.photos.length} photo
                    {slice.photos.length === 1 ? '' : 's'} attached
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Currency
                  amount={slice.snapshot.unitPriceInr}
                  className="text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    const query = new URLSearchParams({
                      slice: slice.draftId,
                    });
                    if (slice.lane === 'PROTECTED') query.set('complaint', '1');
                    router.push(
                      `/orders/${orderId}/returns/new/${slice.orderItemId}?${query.toString()}`
                    );
                  }}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  <Pencil size={12} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Refund target */}
        {needsRefundDestination && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              Where should we send the refund?
            </h2>
            {refundPolicy ? (
              <RefundTargetSelector
                allowedTypes={refundPolicy.refundTargetPolicy.allowedTypes}
                codRefundMethod={
                  refundPolicy.refundTargetPolicy.codRefundMethod
                }
                savedMasked={refundPolicy.savedRefundTarget?.masked}
                savedIsStale={refundPolicy.savedRefundTarget?.isStale}
                onChange={setRefundTarget}
              />
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-border p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading refund options…
              </div>
            )}
          </div>
        )}

        {/* Policy acceptance */}
        <div className="mt-6">
          <label className="flex items-start gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={policyChecked}
              onChange={(e) => setPolicyChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-muted-foreground">
              I agree to the store’s{' '}
              {storePolicy?.url ? (
                <a
                  href={storePolicy.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  return policy
                </a>
              ) : storePolicy?.text ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPolicyTextOpen((open) => !open);
                  }}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  return policy
                </button>
              ) : (
                'return policy'
              )}
              . Refund amounts shown are estimates and are confirmed after
              pickup and inspection.
            </span>
          </label>
          {policyTextOpen && storePolicy?.text && (
            <div className="mt-2 max-h-56 overflow-y-auto whitespace-pre-line rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              {storePolicy.text}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!policyChecked || !refundTargetReady || submitting}
            className="btn-press inline-flex items-center gap-2 rounded-full bg-primary px-7 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit and continue
          </button>
        </div>
      </div>

      {/* Mid-flow step-up: verifying re-runs the submit with the basket intact. */}
      <OtpModal orderId={orderId} onVerified={() => void handleSubmit()} />
    </Container>
  );
};

export default ReturnReviewClient;
