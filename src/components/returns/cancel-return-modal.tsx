'use client';

/**
 * CancelReturnModal — cancel an in-progress return / exchange / replacement.
 *
 * Reachable only when the hub reported `returns[].canCancel`. Fetches the
 * return-cancel preview to surface any price-difference refund that would be
 * reversed, then confirms with a placeholder reason (seller-configured reasons
 * land in the backend later, same as order cancellation).
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import IconButton from '@/components/ui/icon-button';
import Currency from '@/components/ui/currency';
import {
  cancelReturn,
  getReturnCancelPreview,
  ReturnsApiError,
} from '@/lib/returns-api';
import type { RrCancelPreviewResponse } from '@/lib/returns-types';

const PLACEHOLDER_REASONS: Array<{ code: string; label: string }> = [
  { code: 'CHANGED_MIND', label: 'Changed my mind' },
  { code: 'KEEPING_ITEM', label: 'Decided to keep the item' },
  { code: 'CREATED_BY_MISTAKE', label: 'Created this request by mistake' },
  { code: 'OTHER', label: 'Other reason' },
];

interface CancelReturnModalProps {
  orderId: string;
  returnNumber: string | null;
  onClose: () => void;
  onCancelled: () => void;
}

const CancelReturnModal: React.FC<CancelReturnModalProps> = ({
  orderId,
  returnNumber,
  onClose,
  onCancelled,
}) => {
  const open = returnNumber !== null;
  const [preview, setPreview] = useState<RrCancelPreviewResponse | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [reasonCode, setReasonCode] = useState<string | null>(null);
  const [reasonText, setReasonText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!returnNumber) {
      setPreview(null);
      setReasonCode(null);
      setReasonText('');
      setSubmitting(false);
      return;
    }
    const controller = new AbortController();
    setLoadingPreview(true);
    getReturnCancelPreview(orderId, returnNumber, controller.signal)
      .then(setPreview)
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setPreview(null);
      })
      .finally(() => setLoadingPreview(false));
    return () => controller.abort();
  }, [orderId, returnNumber]);

  const handleConfirm = async () => {
    if (!returnNumber || !reasonCode) {
      toast.error('Please select a reason.');
      return;
    }
    if (reasonCode === 'OTHER' && reasonText.trim().length === 0) {
      toast.error('Please tell us the reason.');
      return;
    }
    setSubmitting(true);
    try {
      await cancelReturn(
        orderId,
        returnNumber,
        reasonCode,
        reasonText.trim() || undefined
      );
      toast.success('Your request has been cancelled.');
      onClose();
      onCancelled();
    } catch (err) {
      const code = err instanceof ReturnsApiError ? err.code : 'UNKNOWN';
      toast.error(
        code === 'RETURN_CANCEL_NOT_ALLOWED'
          ? 'This request can no longer be cancelled.'
          : 'Couldn’t cancel the request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const blocked = preview?.canCancel === false;

  return (
    <Transition show={open} appear as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onClose}>
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
                  Cancel this request?
                </Dialog.Title>
                <p className="mt-1 text-sm text-muted-foreground">
                  {returnNumber && `Request ${returnNumber}. `}This can’t be
                  undone.
                </p>

                {loadingPreview ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Checking
                    details…
                  </div>
                ) : (
                  preview &&
                  preview.refundsRequired.length > 0 && (
                    <div className="mt-4 rounded-xl bg-muted/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Will be reversed
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
                      'This request can no longer be cancelled.'}
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
                          name="cancel-return-reason"
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
                    Keep request
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
                      Cancel request
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

export default CancelReturnModal;
