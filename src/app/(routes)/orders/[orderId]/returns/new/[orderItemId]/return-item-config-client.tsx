'use client';

/**
 * ReturnItemConfigClient — the FULL-PAGE per-item return configurator
 * (reason-first, Amazon-style). One order item → one basket slice.
 *
 * Flow:
 *   1. Why?      → <ReasonPicker /> (reason + detailed + resolution + free-text)
 *   2. How many? → quantity stepper (capped at qtyAvailable)
 *   3. Photos    → <PhotoUploader /> (when the store, product, or reason asks
 *                  for photo evidence on the selected remedy)
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

/** Why the review screen sent the customer back here, in their words. */
const RECOVERY_ISSUE_COPY: Record<string, string> = {
  PHOTOS_REQUIRED:
    'This store needs at least one photo of the item for this request. Add a photo below and continue.',
  REASON_PHOTOS_REQUIRED:
    'The reason you picked needs at least one photo. Add a photo below and continue.',
  PHOTO_QUOTA_EXCEEDED:
    'You added more photos than this store allows for this item. Remove a few and continue.',
  UNTRUSTED_EVIDENCE_IMAGE:
    'One of your photos couldn’t be verified. Please remove it and upload again from this page.',
  REASON_DETAIL_REQUIRED:
    'Please pick a more specific sub-reason so we can route your request correctly.',
  REASON_FREE_TEXT_REQUIRED:
    'Please describe the issue in your own words before we submit.',
  EXCHANGE_CHOICE_REQUIRED: 'Please choose the variant you would like instead.',
  EXCHANGE_VARIANT_OUT_OF_STOCK:
    'The variant you chose just went out of stock. Please pick another one.',
  RESOLUTION_OUT_OF_STOCK:
    'The option you chose just became unavailable. Please pick another one.',
  RESOLUTION_NOT_ALLOWED:
    'That option is no longer available for this item. Please pick another one.',
  REASON_RESOLUTION_NOT_PERMITTED:
    'That option is no longer available for the reason you picked. Please choose again.',
  REASON_INACTIVE:
    'The reason you picked is no longer offered. Please choose another one.',
  REASON_NOT_FOUND:
    'The reason you picked is no longer offered. Please choose another one.',
  DETAILED_REASON_INACTIVE:
    'The sub-reason you picked is no longer offered. Please choose another one.',
  DETAILED_REASON_NOT_IN_PARENT:
    'The sub-reason you picked is no longer offered. Please choose another one.',
  REASON_BLOCKED_BY_NONRETURNABLE:
    'This item can’t be returned for that reason. If something is wrong with the product, use “Report a problem”.',
};

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
  const recoveryIssue = searchParams.get('issue');

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
    if (!reasonsRes) return [];
    return complaintMode
      ? reasonsRes.lanes.protected.reasons
      : reasonsRes.lanes.commercial.reasons;
  }, [reasonsRes, complaintMode]);
  const selectedReason: ReasonConfig | null = useMemo(
    () => reasons.find((r) => r.reasonConfigId === reasonConfigId) ?? null,
    [reasons, reasonConfigId]
  );

  const qtyAvailable = eligibilityItem?.qtyAvailable ?? 1;
  const snapshot = eligibilityItem?.snapshot;

  const handleReasonChange = (reason: ReasonConfig) => {
    setReasonConfigId(reason.reasonConfigId);
    setReasonDetailedId(null);
    setReasonText(null);
    const seeded =
      reason.defaultResolution ?? reason.availableResolutions[0] ?? 'REFUND';
    setResolution(seeded);
    setExchangeChoice(null);
  };

  const handleResolutionChange = (res: Resolution) => {
    setResolution(res);
    setExchangeChoice(null);
  };

  useEffect(() => {
    if (
      selectedReason &&
      !selectedReason.availableResolutions.includes(resolution)
    ) {
      setResolution(
        selectedReason.defaultResolution ??
          selectedReason.availableResolutions[0] ??
          'REFUND'
      );
      setExchangeChoice(null);
    }
  }, [selectedReason, resolution]);

  // Photo evidence can be demanded by the store, by the product, or by the
  // reason, and the answer differs per remedy. The backend rejects the whole
  // submission on a mismatch, so gate on the same merged value it checks.
  const needsPhotos = Boolean(
    selectedReason?.requiresPhotoByResolution?.[resolution] ??
    selectedReason?.requiresPhoto
  );
  // True when the requirement comes from store/product policy rather than the
  // chosen reason — the copy explains why photos appear on a "changed my mind".
  const photosRequiredByStorePolicy = Boolean(
    needsPhotos && selectedReason && !selectedReason.reasonRequiresPhoto
  );
  const needsVariant =
    resolution === 'EXCHANGE' || resolution === 'REPLACEMENT';

  const validationErrors = useMemo(() => {
    const errors: {
      reason?: string;
      detailedReason?: string;
      reasonText?: string;
      photos?: string;
      exchangeChoice?: string;
    } = {};
    if (!selectedReason) {
      errors.reason = 'Please pick a reason.';
      return errors;
    }
    if (selectedReason.requiresSubReason && !reasonDetailedId) {
      errors.detailedReason = 'Please pick a specific sub-reason.';
    }
    if (!selectedReason.availableResolutions.includes(resolution)) {
      errors.reason = 'Please choose an available resolution.';
    }
    if (
      selectedReason.requiresFreeText &&
      !(reasonText && reasonText.trim().length > 0)
    ) {
      errors.reasonText = 'Please tell us a bit more.';
    }
    if (needsPhotos && photos.length === 0) {
      errors.photos = photosRequiredByStorePolicy
        ? 'This store needs at least one photo of the item before it can accept this request.'
        : 'Add at least one clear photo for this reason.';
    }
    if (needsVariant && !exchangeChoice) {
      errors.exchangeChoice = 'Please pick a variant.';
    }
    return errors;
  }, [
    selectedReason,
    reasonDetailedId,
    reasonText,
    resolution,
    needsPhotos,
    photosRequiredByStorePolicy,
    photos,
    needsVariant,
    exchangeChoice,
  ]);
  const validationError = Object.values(validationErrors)[0] ?? null;

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
      reasonLabel: selectedReason?.label ?? null,
      detailedReasonLabel:
        selectedReason?.detailedReasons.find((d) => d.id === reasonDetailedId)
          ?.label ?? null,
      reasonText,
      photos,
      exchangeChoice,
      lane: complaintMode ? 'PROTECTED' : 'COMMERCIAL',
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
  if (reasons.length === 0) {
    return (
      <Container>
        <div className="mx-auto max-w-2xl py-8">
          <BackLink orderId={orderId} router={router} />
          <h1 className="mt-4 text-lg font-semibold">
            {complaintMode
              ? 'No complaint options available'
              : 'No return options available'}
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

        {recoveryIssue && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
          >
            <p className="font-semibold">One more thing before we submit</p>
            <p className="mt-0.5">
              {RECOVERY_ISSUE_COPY[recoveryIssue] ??
                'This item needs another look before your request can go through. Everything you already filled in has been kept.'}
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
            errors={validationErrors}
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
            <h2 className="mb-1 text-sm font-semibold text-foreground">
              Add photos
              <span className="ml-1 font-normal text-red-600">*</span>
            </h2>
            <p className="mb-3 text-xs text-muted-foreground">
              {photosRequiredByStorePolicy
                ? 'This store asks for photos of the item on every request of this kind. Clear, well-lit photos speed up approval.'
                : 'Show us the issue clearly — this helps us approve your request faster.'}
            </p>
            <PhotoUploader
              orderId={orderId}
              orderItemId={orderItemId}
              quantity={quantity}
              maxImagesPerUnit={maxImagesPerUnit}
              photos={photos}
              onChange={setPhotos}
            />
            {validationErrors.photos && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {validationErrors.photos}
              </p>
            )}
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
            {validationErrors.exchangeChoice && (
              <p role="alert" className="mt-2 text-xs text-red-600">
                {validationErrors.exchangeChoice}
              </p>
            )}
          </section>
        )}

        {/* Submit */}
        <div className="mt-8 flex items-center justify-end gap-3">
          {validationError && (
            <p
              id="return-form-error-summary"
              role="alert"
              className="mr-auto text-sm text-red-600"
            >
              {validationError}
            </p>
          )}
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
            aria-describedby={
              validationError ? 'return-form-error-summary' : undefined
            }
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
