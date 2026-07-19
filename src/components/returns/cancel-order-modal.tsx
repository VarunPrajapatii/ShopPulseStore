'use client';

/**
 * CancelOrderModal — cancel an order with a reason.
 *
 * Decision (locked): reasons are PLACEHOLDER UI for now; the seller will wire
 * real seller-configured reasons in the backend later. The reason `code`s below
 * are stable placeholders so the submit shape is already correct.
 *
 * On open we fetch the cancel preview to show the exact refund legs and whether
 * cancellation is instant or needs seller confirmation. Cancel is only ever
 * reachable when the hub reported `order.canCancel` — we never re-derive it.
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import IconButton from '@/components/ui/icon-button';
import Currency from '@/components/ui/currency';
import {
  cancelOrderByCustomer,
  getCancelPreview,
  ReturnsApiError,
} from '@/lib/returns-api';
import type { CancelPreviewResponse } from '@/lib/returns-types';

// PLACEHOLDER reasons — replace with seller-configured list when backend lands.
const PLACEHOLDER_REASONS: Array<{ code: string; label: string }> = [
  { code: 'ORDERED_BY_MISTAKE', label: 'Ordered by mistake' },
  { code: 'BETTER_PRICE_ELSEWHERE', label: 'Found a better price elsewhere' },
  { code: 'DELIVERY_TOO_SLOW', label: 'Item won’t arrive in time' },
  {
    code: 'CHANGE_ORDER_DETAILS',
    label: 'Need to change address or order details',
  },
  { code: 'OTHER', label: 'Other reason' },
];

interface CancelOrderModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
  onCancelled: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  open,
  onClose,
  onCancelled,
}) => {
  const [preview, setPreview] = useState<CancelPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [reasonCode, setReasonCode] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPreview(null);
      setReasonCode(null);
      setReasonText('');
      setSubmitting(false);
      return;
    }
    const controller = new AbortController();
    setLoadingPreview(true);
    getCancelPreview(orderId, controller.signal)
      .then(setPreview)
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Preview is informational; cancellation can still proceed.
        setPreview(null);
      })
      .finally(() => setLoadingPreview(false));
    return () => controller.abort();
  }, [open, orderId]);

  const handleConfirm = async () => {
    if (!reasonCode) {
      toast.error('Please select a reason.');
      return;
    }
    if (reasonCode === 'OTHER' && reasonText.trim().length === 0) {
      toast.error('Please tell us the reason.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await cancelOrderByCustomer(
        orderId,
        reasonCode,
        reasonText.trim() || undefined
      );
      toast.success(
        res.newStatus === 'CANCELLED'
          ? 'Your order has been cancelled.'
          : 'Cancellation requested. We’ll confirm shortly.'
      );
      onClose();
      onCancelled();
    } catch (err) {
      const code = err instanceof ReturnsApiError ? err.code : 'UNKNOWN';
      toast.error(
        code === 'CANCELLATION_NOT_ALLOWED'
          ? 'This order can no longer be cancelled.'
          : 'Couldn’t cancel the order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const blocked = preview?.canCancel === false;

  return (
    <Transition show={open} appear as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                <div className="absolute right-4 top-4">
                  <IconButton onClick={onClose} icon={<X size={15} />} />
                </div>

                <Dialog.Title className="text-lg font-semibold text-foreground">
                  Cancel this order?
                </Dialog.Title>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us why you’re cancelling. This can’t be undone.
                </p>

                {loadingPreview ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking refund
                    details…
                  </div>
                ) : (
                  preview &&
                  preview.refundsRequired.length > 0 && (
                    <div className="mt-4 rounded-xl bg-muted/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Refund on cancellation
                      </p>
                      <ul className="mt-2 space-y-1">
                        {preview.refundsRequired.map((leg, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {leg.descriptionInr}
                            </span>
                            <Currency
                              amount={leg.amountInr}
                              className="text-sm"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                )}

                {blocked ? (
                  <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {preview?.blockedReason ??
                      'This order can no longer be cancelled.'}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {PLACEHOLDER_REASONS.map((reason) => (
                      <label
                        key={reason.code}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm transition hover:border-primary"
                      >
                        <input
                          type="radio"
                          name="cancel-reason"
                          value={reason.code}
                          checked={reasonCode === reason.code}
                          onChange={() => setReasonCode(reason.code)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="text-foreground">{reason.label}</span>
                      </label>
                    ))}

                    {reasonCode === 'OTHER' && (
                      <textarea
                        value={reasonText}
                        onChange={(e) =>
                          setReasonText(e.target.value.slice(0, 500))
                        }
                        rows={3}
                        placeholder="Tell us a bit more…"
                        className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:border-primary"
                      />
                    )}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Keep order
                  </button>
                  {!blocked && (
                    <button
                      type="button"
                      disabled={submitting || !reasonCode}
                      onClick={handleConfirm}
                      className="flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Cancel order
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CancelOrderModal;
