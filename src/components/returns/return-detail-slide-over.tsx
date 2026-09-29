'use client';

/**
 * ReturnDetailSlideOver — right-side panel showing the full detail of one
 * return / exchange / replacement, fetched on demand via `/returns/{number}`.
 *
 * Shows the reason, customer photos and notes, and the full event timeline.
 * Opens whenever `returnNumber` is non-null.
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import IconButton from '@/components/ui/icon-button';
import PhotoUploader from '@/components/returns/photo-uploader';
import StatusBadge from '@/components/returns/status-badge';
import {
  getReturnByNumber,
  provideReturnEvidence,
  ReturnsApiError,
} from '@/lib/returns-api';
import type { ReturnByNumberResponse } from '@/lib/returns-types';

interface ReturnDetailSlideOverProps {
  orderId: string;
  returnNumber: string | null;
  onClose: () => void;
  onAuthRequired: (resume: () => void) => void;
  onUpdated: () => void;
  supportEmail: string | null;
  grievanceEmail: string | null;
}

function humanize(kind: string | undefined | null): string {
  if (!kind) {
    return 'Unknown';
  }
  return kind
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatDateTime(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const ReturnDetailSlideOver: React.FC<ReturnDetailSlideOverProps> = ({
  orderId,
  returnNumber,
  onClose,
  onAuthRequired,
  onUpdated,
  supportEmail,
  grievanceEmail,
}) => {
  const open = returnNumber !== null;
  const [data, setData] = useState<ReturnByNumberResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'auth'>(
    'loading'
  );
  const [reloadVersion, setReloadVersion] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [responseImages, setResponseImages] = useState<string[]>([]);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const requestReload = useCallback(
    () => setReloadVersion((version) => version + 1),
    []
  );

  const loadDetail = useCallback(
    async (signal?: AbortSignal) => {
      if (!returnNumber) return;
      setStatus('loading');
      try {
        const result = await getReturnByNumber(orderId, returnNumber, signal);
        setData(result);
        setStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        if (error instanceof ReturnsApiError && error.isAuthError) {
          setStatus('auth');
          onAuthRequired(requestReload);
          return;
        }
        setStatus('error');
      }
    },
    [onAuthRequired, orderId, requestReload, returnNumber]
  );

  useEffect(() => {
    if (!returnNumber) return;
    const controller = new AbortController();
    setData(null);
    setResponseText('');
    setResponseImages([]);
    setEvidenceError(null);
    void loadDetail(controller.signal);
    return () => controller.abort();
  }, [loadDetail, reloadVersion, returnNumber]);

  const detail = data?.return;

  const handleEvidenceSubmit = async () => {
    if (!detail || detail.status !== 'AWAITING_CUSTOMER_EVIDENCE') return;
    const trimmedResponse = responseText.trim();
    if (!trimmedResponse && responseImages.length === 0) {
      setEvidenceError('Add a response or at least one photo.');
      return;
    }

    setEvidenceError(null);
    setSubmittingEvidence(true);
    try {
      await provideReturnEvidence(orderId, detail.id, {
        responseText: trimmedResponse || null,
        images: responseImages,
      });
      setResponseText('');
      setResponseImages([]);
      toast.success('Evidence sent for review.');
      await loadDetail();
      onUpdated();
    } catch (error) {
      if (error instanceof ReturnsApiError && error.isAuthError) {
        onAuthRequired(() => void handleEvidenceSubmit());
        return;
      }
      const code = error instanceof ReturnsApiError ? error.code : 'UNKNOWN';
      setEvidenceError(
        code === 'EVIDENCE_NOT_REQUESTED' || code === 'RETURN_STATE_CHANGED'
          ? 'This request has already changed. Refreshing its latest status.'
          : code === 'PHOTO_QUOTA_EXCEEDED'
            ? 'Too many follow-up photos were selected.'
            : 'Couldn’t send the evidence. Please try again.'
      );
      if (
        code === 'EVIDENCE_NOT_REQUESTED' ||
        code === 'RETURN_STATE_CHANGED'
      ) {
        await loadDetail();
        onUpdated();
      }
    } finally {
      setSubmittingEvidence(false);
    }
  };

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

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="flex h-full w-screen max-w-md flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <Dialog.Title className="text-base font-semibold text-foreground">
                    {returnNumber ? `Return ${returnNumber}` : 'Return details'}
                  </Dialog.Title>
                  <IconButton onClick={onClose} icon={<X size={15} />} />
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {status === 'loading' && (
                    <div className="flex h-40 items-center justify-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  )}

                  {status === 'error' && (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                      Couldn’t load this return right now.
                    </p>
                  )}

                  {status === 'auth' && (
                    <div
                      className="py-10 text-center text-sm text-muted-foreground"
                      role="status"
                    >
                      Verify your order to view this return.
                    </div>
                  )}

                  {status === 'ready' && detail && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">
                          {humanize(detail.resolution)} · Qty {detail.quantity}
                        </span>
                        <StatusBadge status={detail.status} />
                      </div>

                      {/* Reason */}
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Reason
                        </h3>
                        <p className="mt-1 text-sm text-foreground">
                          {detail.reason.label}
                        </p>
                        {detail.reason.detailedLabel && (
                          <p className="text-sm text-muted-foreground">
                            {detail.reason.detailedLabel}
                          </p>
                        )}
                        {detail.reason.freeText && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            “{detail.reason.freeText}”
                          </p>
                        )}
                      </div>

                      {/* Customer photos */}
                      {detail.customerImages &&
                        detail.customerImages.filter(
                          (url) => url && typeof url === 'string'
                        ).length > 0 && (
                          <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Photos
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {detail.customerImages
                                .filter((url) => url && typeof url === 'string')
                                .map((url, i) => (
                                  <div
                                    key={i}
                                    className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Return photo ${i + 1}`}
                                      fill
                                      sizes="80px"
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                      {/* Notes */}
                      {detail.customerNotes && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Your notes
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {detail.customerNotes}
                          </p>
                        </div>
                      )}

                      {/* Follow-up evidence */}
                      {detail.evidenceRequest && (
                        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <h3 className="text-sm font-semibold text-amber-900">
                            {detail.status === 'AWAITING_CUSTOMER_EVIDENCE'
                              ? 'More information needed'
                              : 'Additional evidence request'}
                          </h3>
                          <p className="mt-1 text-sm text-amber-900">
                            {detail.evidenceRequest.message}
                          </p>
                          {detail.evidenceRequest.requestedAt && (
                            <p className="mt-1 text-xs text-amber-700">
                              Requested{' '}
                              {formatDateTime(
                                detail.evidenceRequest.requestedAt
                              )}
                            </p>
                          )}

                          {detail.status === 'AWAITING_CUSTOMER_EVIDENCE' ? (
                            <div className="mt-4 space-y-4 border-t border-amber-200 pt-4">
                              <div>
                                <label
                                  htmlFor="evidence-response"
                                  className="text-xs font-semibold text-amber-900"
                                >
                                  Your response
                                </label>
                                <textarea
                                  id="evidence-response"
                                  value={responseText}
                                  onChange={(event) => {
                                    setResponseText(
                                      event.target.value.slice(0, 2000)
                                    );
                                    setEvidenceError(null);
                                  }}
                                  rows={4}
                                  maxLength={2000}
                                  placeholder="Answer the seller’s question or describe the new evidence."
                                  className="mt-1.5 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <p className="mt-1 text-right text-xs text-amber-700">
                                  {responseText.length}/2000
                                </p>
                              </div>

                              <div>
                                <p className="mb-2 text-xs font-semibold text-amber-900">
                                  Additional photos
                                </p>
                                <PhotoUploader
                                  orderId={orderId}
                                  orderItemId={detail.orderItemId}
                                  quantity={detail.quantity}
                                  maxImagesPerUnit={detail.maxImagesPerUnit}
                                  photos={responseImages}
                                  onChange={(images) => {
                                    setResponseImages(images);
                                    setEvidenceError(null);
                                  }}
                                  onAuthRequired={() =>
                                    onAuthRequired(requestReload)
                                  }
                                />
                              </div>

                              {evidenceError && (
                                <p
                                  className="text-sm font-medium text-red-700"
                                  role="alert"
                                >
                                  {evidenceError}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() => void handleEvidenceSubmit()}
                                disabled={
                                  submittingEvidence ||
                                  (!responseText.trim() &&
                                    responseImages.length === 0)
                                }
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {submittingEvidence ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                                Send evidence
                              </button>
                            </div>
                          ) : (
                            detail.evidenceRequest.providedAt && (
                              <div className="mt-3 border-t border-amber-200 pt-3">
                                <p className="text-xs font-semibold text-amber-900">
                                  Evidence sent{' '}
                                  {formatDateTime(
                                    detail.evidenceRequest.providedAt
                                  )}
                                </p>
                                {detail.evidenceRequest.responseText && (
                                  <p className="mt-1 text-sm text-amber-900">
                                    {detail.evidenceRequest.responseText}
                                  </p>
                                )}
                                {detail.evidenceRequest.responseImages.length >
                                  0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {detail.evidenceRequest.responseImages.map(
                                      (url, index) => (
                                        <div
                                          key={url}
                                          className="relative h-20 w-20 overflow-hidden rounded-lg bg-white"
                                        >
                                          <Image
                                            src={url}
                                            alt={`Follow-up evidence ${index + 1}`}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </section>
                      )}

                      {/* Rejection */}
                      {detail.rejection && (
                        <section className="rounded-xl border border-red-200 bg-red-50 p-4">
                          <h3 className="text-sm font-semibold text-red-800">
                            Request not approved
                          </h3>
                          <p className="mt-1 text-xs font-medium text-red-700">
                            {humanize(detail.rejection.category)}
                          </p>
                          {detail.rejection.explanation && (
                            <p className="mt-2 text-sm text-red-800">
                              {detail.rejection.explanation}
                            </p>
                          )}
                          {detail.rejection.evidenceImages.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {detail.rejection.evidenceImages.map(
                                (url, index) => (
                                  <div
                                    key={url}
                                    className="relative h-20 w-20 overflow-hidden rounded-lg bg-white"
                                  >
                                    <Image
                                      src={url}
                                      alt={`Review evidence ${index + 1}`}
                                      fill
                                      sizes="80px"
                                      className="object-cover"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                          {(grievanceEmail || supportEmail) && (
                            <p className="mt-3 border-t border-red-200 pt-3 text-xs text-red-700">
                              Need help? Contact{' '}
                              <a
                                href={`mailto:${grievanceEmail ?? supportEmail}`}
                                className="font-semibold underline"
                              >
                                {grievanceEmail ?? supportEmail}
                              </a>
                              .
                            </p>
                          )}
                        </section>
                      )}

                      {/* Timeline */}
                      {detail.events.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Timeline
                          </h3>
                          <ol className="mt-3 space-y-4">
                            {detail.events.map((event, i) => (
                              <li key={i} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                                  {i < detail.events.length - 1 && (
                                    <span className="mt-1 w-px flex-1 bg-border" />
                                  )}
                                </div>
                                <div className="-mt-0.5 pb-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {humanize(event.kind)}
                                  </p>
                                  {formatDateTime(event.at) && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatDateTime(event.at)}
                                    </p>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
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

export default ReturnDetailSlideOver;
