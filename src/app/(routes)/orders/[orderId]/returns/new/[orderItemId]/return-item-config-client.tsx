'use client';

/**
 * ReturnItemConfigClient — the FULL-PAGE per-item return configurator
 * (reason-first, Amazon-style). One order item → one basket slice.
 *
 * Flow:
 *   1. Why?      → <ReasonPicker /> (reason + detailed + resolution + free-text)
 *   2. How many? → quantity stepper (capped at qtyAvailable)
 *   3. Photos    → <PhotoUploader /> (only when the reason requires photos)
 *   4. Variant   → <VariantPicker /> (only for EXCHANGE / REPLACEMENT)
 *
 * "Add to return" validates the slice, persists it to the basket, and returns
 * to the picker. Editing an existing slice is via `?slice=<draftId>`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ImageOff, Loader2, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import Container from '@/components/ui/container';
import Currency from '@/components/ui/currency';
import ReasonPicker from '@/components/returns/reason-picker';
import PhotoUploader from '@/components/returns/photo-uploader';
import VariantPicker from '@/components/returns/variant-picker';
import OtpModal from '@/components/returns/otp-modal';
import { getEligibility, getReasons, ReturnsApiError } from '@/lib/returns-api';
import type {
  EligibilityItem,
  EligibilityResponse,
  ExchangeVariant,
  ReasonConfig,
  ReasonsResponse,
  Resolution,
} from '@/lib/returns-types';
import useReturnBasket from '@/hooks/use-return-basket';
import useOrderSession from '@/hooks/use-order-session';

interface ReturnItemConfigClientProps {
  orderId: string;
  orderItemId: string;
}

const ReturnItemConfigClient = ({
  orderId,
  orderItemId,
}: ReturnItemConfigClientProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editDraftId = searchParams.get('slice');
  // Complaint path: non-returnable items can still raise a
  // protected-reason complaint (damaged-on-arrival / not-as-described). Only
  // system-protected reasons render in this mode.
  const complaintMode = searchParams.get('complaint') === '1';

  const [reasonsRes, setReasonsRes] = useState<ReasonsResponse | null>(null);
  const [eligibilityItem, setEligibilityItem] =
    useState<EligibilityItem | null>(null);
  const [maxImagesPerUnit, setMaxImagesPerUnit] = useState(5);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'auth'>(
    'loading'
  );

  // ── Form state (mirrors the slice) ──────────────────────────────────────
  const [reasonConfigId, setReasonConfigId] = useState<string | null>(null);
  const [reasonDetailedId, setReasonDetailedId] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>('REFUND');
  const [quantity, setQuantity] = useState(1);
  const [reasonText, setReasonText] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [exchangeChoice, setExchangeChoice] = useState<{
    newProductId: string;
    newVariantId: string;
    quotedDiffInr?: number;
  } | null>(null);

  const { addSlice, updateSlice, getSlice } = useReturnBasket();
  const requestStepUp = useOrderSession((s) => s.requestStepUp);
  const draftIdRef = useRef<string | null>(editDraftId);
  const seededRef = useRef(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setStatus('loading');
      try {
        const [reasons, eligibility]: [ReasonsResponse, EligibilityResponse] =
          await Promise.all([
            getReasons(orderId, orderItemId, signal),
            getEligibility(orderId, signal),
          ]);
        const item =
          eligibility.items.find((i) => i.orderItemId === orderItemId) ?? null;
        setReasonsRes(reasons);
        setEligibilityItem(item);
        setMaxImagesPerUnit(eligibility.policy.maxCustomerImagesPerUnit || 5);
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
    [orderId, orderItemId]
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Seed the form from an existing slice (edit mode) once data is ready.
  useEffect(() => {
    if (status !== 'ready' || seededRef.current || !editDraftId) return;
    const slice = getSlice(orderId, editDraftId);
    if (slice) {
      draftIdRef.current = slice.draftId;
      setReasonConfigId(slice.reasonConfigId);
      setReasonDetailedId(slice.reasonDetailedId);
      setResolution(slice.resolution);
      setQuantity(slice.quantity);
      setReasonText(slice.reasonText);
      setPhotos(slice.photos);
      setExchangeChoice(slice.exchangeChoice);
    }
    seededRef.current = true;
  }, [status, editDraftId, getSlice, orderId]);

  const reasons = useMemo<ReasonConfig[]>(() => {
    const all = reasonsRes?.reasons ?? [];
    return complaintMode ? all.filter((r) => r.isSystemProtected) : all;
  }, [reasonsRes, complaintMode]);
  const selectedReason: ReasonConfig | null = useMemo(
    () => reasons.find((r) => r.reasonConfigId === reasonConfigId) ?? null,
    [reasons, reasonConfigId]
  );

  const qtyAvailable = eligibilityItem?.qtyAvailable ?? 1;
  const snapshot = eligibilityItem?.snapshot;

  const handleReasonChange = (reason: ReasonConfig) => {
    setReasonConfigId(reason.reasonConfigId);
    const firstDetailed =
      reason.detailedReasons?.find((d) => d.isActive) ?? null;
    setReasonDetailedId(firstDetailed?.reasonDetailedId ?? null);
    const seeded =
      reason.defaultResolution ?? reason.availableResolutions[0] ?? 'REFUND';
    setResolution(seeded);
    setExchangeChoice(null);
  };

  const handleResolutionChange = (res: Resolution) => {
    setResolution(res);
    setExchangeChoice(null);
  };

  const needsPhotos = !!selectedReason?.requiresPhoto;
  const needsVariant =
    resolution === 'EXCHANGE' || resolution === 'REPLACEMENT';

  const validationError = useMemo<string | null>(() => {
    if (!selectedReason) return 'Please pick a reason.';
    const hasDetailed =
      (selectedReason.detailedReasons?.filter((d) => d.isActive).length ?? 0) >
      0;
    if (hasDetailed && !reasonDetailedId)
      return 'Please pick a specific sub-reason.';
    if (
      selectedReason.requiresDetail &&
      !(reasonText && reasonText.trim().length > 0)
    )
      return 'Please tell us a bit more.';
    if (needsPhotos && photos.length === 0)
      return 'This reason needs at least one photo.';
    if (needsVariant && !exchangeChoice) return 'Please pick a variant.';
    return null;
  }, [
    selectedReason,
    reasonDetailedId,
    reasonText,
    needsPhotos,
    photos,
    needsVariant,
    exchangeChoice,
  ]);

  const handleAddToReturn = () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!snapshot) return;

    let draftId = draftIdRef.current;
    if (!draftId) {
      draftId = addSlice(orderId, {
        orderItemId,
        snapshot: {
          productName: snapshot.productName,
          variantLabel: snapshot.variantLabel,
          imageUrl: snapshot.imageUrl,
          unitPriceInr: snapshot.unitPrice,
        },
      });
      draftIdRef.current = draftId;
    }

    updateSlice(orderId, draftId, {
      quantity,
      resolution,
      reasonConfigId,
      reasonDetailedId,
      reasonText,
      photos,
      exchangeChoice,
      configured: true,
    });

    toast.success('Added to your return');
    router.push(`/orders/${orderId}/returns/new`);
  };

  // ── Render states ────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Container>
    );
  }

  if (status === 'error' || status === 'auth' || !reasonsRes) {
    return (
      <Container>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-lg font-semibold">
            {status === 'auth'
              ? 'Verification needed'
              : 'Couldn’t load return reasons'}
          </h1>
          {status === 'auth' ? (
            <button
              type="button"
              onClick={() => requestStepUp({ type: 'START_RETURN' }, 'RETURN')}
              className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Verify to continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          )}
        </div>
        <OtpModal orderId={orderId} onVerified={() => void load()} />
      </Container>
    );
  }

  // Non-returnable item with no usable reasons (after any complaint filtering).
  if ((reasonsRes.nonReturnable || complaintMode) && reasons.length === 0) {
    return (
      <Container>
        <div className="mx-auto max-w-2xl py-8">
          <BackLink orderId={orderId} router={router} />
          <h1 className="mt-4 text-lg font-semibold">
            {complaintMode
              ? 'No complaint options available'
              : 'This item can’t be returned'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {complaintMode
              ? 'There are no complaint categories available for this item right now. Please contact support.'
              : (reasonsRes.nonReturnableReason ??
                'This item is marked non-returnable.')}
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="mx-auto max-w-2xl py-6">
        <BackLink orderId={orderId} router={router} />

        {complaintMode && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Filing a complaint</p>
            <p className="mt-0.5">
              This item isn’t eligible for a standard return, but you can still
              report a problem like damage on arrival or an item not as
              described.
            </p>
          </div>
        )}

        {/* Item header */}
        {snapshot && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              {snapshot.imageUrl ? (
                <Image
                  src={snapshot.imageUrl}
                  alt={snapshot.productName}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageOff size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {snapshot.productName}
              </p>
              {snapshot.variantLabel && (
                <p className="truncate text-xs text-muted-foreground">
                  {snapshot.variantLabel}
                </p>
              )}
              <Currency
                amount={snapshot.unitPrice}
                className="text-xs font-semibold"
              />
            </div>
          </div>
        )}

        {/* Step 1 — Why? */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            Why are you returning this?
          </h2>
          <ReasonPicker
            reasons={reasons}
            reasonConfigId={reasonConfigId}
            reasonDetailedId={reasonDetailedId}
            resolution={resolution}
            reasonText={reasonText}
            onReasonChange={handleReasonChange}
            onDetailedChange={setReasonDetailedId}
            onResolutionChange={handleResolutionChange}
            onReasonTextChange={setReasonText}
          />
        </section>

        {/* Step 2 — How many? */}
        {selectedReason && qtyAvailable > 1 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              How many?
            </h2>
            <div className="inline-flex items-center gap-3 rounded-full border border-border px-2 py-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground disabled:opacity-40"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(qtyAvailable, q + 1))
                }
                disabled={quantity >= qtyAvailable}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground disabled:opacity-40"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="ml-3 text-xs text-muted-foreground">
              {qtyAvailable} available
            </span>
          </section>
        )}

        {/* Step 3 — Photos */}
        {selectedReason && needsPhotos && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              Add photos
            </h2>
            <PhotoUploader
              orderId={orderId}
              orderItemId={orderItemId}
              quantity={quantity}
              maxImagesPerUnit={maxImagesPerUnit}
              photos={photos}
              onChange={setPhotos}
            />
          </section>
        )}

        {/* Step 4 — Variant / Unit */}
        {selectedReason && needsVariant && reasonConfigId && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-foreground">
              {resolution === 'REPLACEMENT'
                ? 'Confirm replacement'
                : 'Choose a variant'}
            </h2>
            <VariantPicker
              orderId={orderId}
              orderItemId={orderItemId}
              reasonConfigId={reasonConfigId}
              reasonDetailedId={reasonDetailedId}
              intent={resolution}
              selectedVariantId={exchangeChoice?.newVariantId ?? null}
              onSelect={(variant: ExchangeVariant, newProductId: string) =>
                setExchangeChoice({
                  newProductId,
                  newVariantId: variant.variantId,
                  quotedDiffInr: Number(variant.priceDiffInr),
                })
              }
              onSwitchToRefund={() => {
                setResolution('REFUND');
                setExchangeChoice(null);
              }}
            />
          </section>
        )}

        {/* Submit */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push(`/orders/${orderId}/returns/new`)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddToReturn}
            disabled={!!validationError}
            className="btn-press rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {editDraftId ? 'Save changes' : 'Add to return'}
          </button>
        </div>
      </div>
    </Container>
  );
};

const BackLink = ({
  orderId,
  router,
}: {
  orderId: string;
  router: ReturnType<typeof useRouter>;
}) => (
  <button
    type="button"
    onClick={() => router.push(`/orders/${orderId}/returns/new`)}
    className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
  >
    <ChevronLeft size={16} />
    Back to items
  </button>
);

export default ReturnItemConfigClient;
