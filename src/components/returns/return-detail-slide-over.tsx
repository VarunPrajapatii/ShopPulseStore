'use client';

/**
 * ReturnDetailSlideOver — right-side panel showing the full detail of one
 * return / exchange / replacement, fetched on demand via `/returns/{number}`.
 *
 * Shows the reason, customer photos and notes, and the full event timeline.
 * Opens whenever `returnNumber` is non-null.
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, X } from 'lucide-react';
import IconButton from '@/components/ui/icon-button';
import StatusBadge from '@/components/returns/status-badge';
import { getReturnByNumber, ReturnsApiError } from '@/lib/returns-api';
import type { ReturnByNumberResponse } from '@/lib/returns-types';

interface ReturnDetailSlideOverProps {
  orderId: string;
  returnNumber: string | null;
  onClose: () => void;
}

function humanize(kind: string): string {
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
}) => {
  const open = returnNumber !== null;
  const [data, setData] = useState<ReturnByNumberResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  useEffect(() => {
    if (!returnNumber) return;
    const controller = new AbortController();
    setStatus('loading');
    setData(null);
    getReturnByNumber(orderId, returnNumber, controller.signal)
      .then((res) => {
        setData(res);
        setStatus('ready');
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (err instanceof ReturnsApiError && err.isAuthError) {
          setStatus('error');
          return;
        }
        setStatus('error');
      });
    return () => controller.abort();
  }, [orderId, returnNumber]);

  const detail = data?.return;

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
                      {detail.customerImages.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Photos
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {detail.customerImages.map((url, i) => (
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

                      {/* Rejection */}
                      {detail.rejectedReason && (
                        <div className="rounded-xl bg-red-50 p-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-red-700">
                            Rejected
                          </h3>
                          <p className="mt-1 text-sm text-red-700">
                            {detail.rejectedReason}
                          </p>
                        </div>
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
