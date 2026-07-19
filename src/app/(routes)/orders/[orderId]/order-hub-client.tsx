'use client';

/**
 * OrderHubClient - the open tracking hub.
 *
 * Responsibilities:
 *  1. Adopt a magic-link token from `?token=...` (sets the session cookie) and
 *     strip it from the URL.
 *  2. Fetch the tracking hub (`credentials: 'include'`) and mirror
 *     `meta.cookieCapabilities` into the in-memory order session.
 *  3. Compose the order card, item list, and return/exchange/replacement cards.
 *  4. Gate every privileged action (cancel, start return, pay difference) behind
 *     the required capability. Magic-link visitors pass straight through;
 *     order-ID visitors get an OTP step-up, after which the action resumes.
 *
 * Server is law: CTA visibility comes only from server flags
 * (`order.canCancel`, `item.canStartReturn`, `returns[].canCancel`).
 */

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, PackageCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Container from '@/components/ui/container';
import HubOrderCard from '@/components/returns/hub-order-card';
import HubItemCard from '@/components/returns/hub-item-card';
import HubReturnCard from '@/components/returns/hub-return-card';
import OtpModal from '@/components/returns/otp-modal';
import CancelOrderModal from '@/components/returns/cancel-order-modal';
import CancelReturnModal from '@/components/returns/cancel-return-modal';
import ReturnDetailSlideOver from '@/components/returns/return-detail-slide-over';
import OrderDetailSlideOver from '@/components/returns/order-detail-slide-over';
import InvoiceOtpModal, {
  type InvoicePurpose,
} from '@/components/returns/invoice-otp-modal';
import {
  adoptLinkToken,
  getTrackingHub,
  payExchangeDiff,
  ReturnsApiError,
  verifyExchangeDiffPayment,
} from '@/lib/returns-api';
import type {
  Capability,
  HubInvoice,
  TrackingHubResponse,
} from '@/lib/returns-types';
import useOrderSession from '@/hooks/use-order-session';
import { useRazorpay } from '@/hooks/use-razorpay';

/** sessionStorage key the review screen uses to hand off fallback notices. */
const FALLBACK_NOTICE_KEY = 'return-submit-fallback';

interface FallbackNotice {
  productName: string;
  variantLabel: string | null;
  estimatedRefundInr: string;
}

interface OrderHubClientProps {
  orderId: string;
}

function OrderHubInner({ orderId }: OrderHubClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setOrderId = useOrderSession((s) => s.setOrderId);
  const setCookieCapabilities = useOrderSession((s) => s.setCookieCapabilities);
  const setFromMagicLink = useOrderSession((s) => s.setFromMagicLink);
  const hasCapability = useOrderSession((s) => s.hasCapability);
  const getRemainingSessionMs = useOrderSession((s) => s.getRemainingSessionMs);
  const requestStepUp = useOrderSession((s) => s.requestStepUp);

  const { open: openRazorpay } = useRazorpay();

  const [hub, setHub] = useState<TrackingHubResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [cancelReturnNumber, setCancelReturnNumber] = useState<string | null>(
    null
  );
  const [detailReturnNumber, setDetailReturnNumber] = useState<string | null>(
    null
  );
  const [fallbackNotices, setFallbackNotices] = useState<FallbackNotice[]>([]);
  const [invoiceModal, setInvoiceModal] = useState<{
    open: boolean;
    purpose: InvoicePurpose;
  }>({ open: false, purpose: 'INVOICE_DOWNLOAD' });

  const adoptedRef = useRef(false);
  const justHandledRef = useRef(false);
  // Action to resume after a successful OTP step-up.
  const pendingResume = useRef<(() => void) | null>(null);

  const loadHub = useCallback(
    async (signal?: AbortSignal) => {
      setStatus('loading');
      setErrorCode(null);
      try {
        const data = await getTrackingHub(orderId, signal);
        setHub(data);
        setCookieCapabilities(data.meta.cookieCapabilities);
        setStatus('ready');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setErrorCode(err instanceof ReturnsApiError ? err.code : 'UNKNOWN');
        setStatus('error');
      }
    },
    [orderId, setCookieCapabilities]
  );

  // Register the active order in the session store.
  useEffect(() => {
    setOrderId(orderId);
  }, [orderId, setOrderId]);

  // Adopt a magic-link token (once), then strip it from the URL and load.
  useEffect(() => {
    const controller = new AbortController();
    const token = searchParams.get('token');

    const run = async () => {
      if (token && !adoptedRef.current) {
        adoptedRef.current = true;
        try {
          const res = await adoptLinkToken(orderId, token);
          setCookieCapabilities(res.capabilities, res.expiresAt);
          setFromMagicLink(true);
        } catch {
          // Invalid/expired token: fall through; hub will show whatever the
          // (possibly anonymous) session can see.
        } finally {
          const params = new URLSearchParams(searchParams.toString());
          params.delete('token');
          const qs = params.toString();
          router.replace(`/orders/${orderId}${qs ? `?${qs}` : ''}`, {
            scroll: false,
          });
        }
      }
      await loadHub(controller.signal);
    };

    void run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Post-submit confirmation banner (?just=submitted).
  useEffect(() => {
    if (justHandledRef.current) return;
    if (searchParams.get('just') === 'submitted') {
      justHandledRef.current = true;
      toast.success('Your request has been submitted.');
      // Surface any fallback conversions handed off by the review screen.
      try {
        const raw = sessionStorage.getItem(FALLBACK_NOTICE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as FallbackNotice[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFallbackNotices(parsed);
          }
          sessionStorage.removeItem(FALLBACK_NOTICE_KEY);
        }
      } catch {
        // Ignore malformed handoff payloads.
      }
      const params = new URLSearchParams(searchParams.toString());
      params.delete('just');
      const qs = params.toString();
      router.replace(`/orders/${orderId}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    }
  }, [searchParams, orderId, router]);

  /** Run `action` if the session already holds `capability`; else step up via OTP. */
  const guard = useCallback(
    (capability: Capability, action: () => void) => {
      if (hasCapability(capability)) {
        const remainingMs = getRemainingSessionMs();
        if (remainingMs !== null && remainingMs < 5 * 60 * 1000) {
          toast('Your session will expire soon. Please complete your action.');
        }
        action();
        return;
      }
      pendingResume.current = action;
      requestStepUp({ type: 'START_RETURN' }, capability);
    },
    [getRemainingSessionMs, hasCapability, requestStepUp]
  );

  const handleOtpVerified = useCallback(() => {
    const resume = pendingResume.current;
    pendingResume.current = null;
    resume?.();
  }, []);

  const handleStartReturn = useCallback(() => {
    guard('RETURN', () => router.push(`/orders/${orderId}/returns/new`));
  }, [guard, router, orderId]);

  const handleStartReturnForItem = useCallback(
    (orderItemId: string) => {
      guard('RETURN', () =>
        router.push(`/orders/${orderId}/returns/new/${orderItemId}`)
      );
    },
    [guard, router, orderId]
  );

  const handleFileComplaint = useCallback(
    (orderItemId: string) => {
      guard('RETURN', () =>
        router.push(`/orders/${orderId}/returns/new/${orderItemId}?complaint=1`)
      );
    },
    [guard, router, orderId]
  );

  const handleCancelOrder = useCallback(() => {
    guard('RETURN', () => setCancelOrderOpen(true));
  }, [guard]);

  const handleCancelReturn = useCallback(
    (returnNumber: string) => {
      guard('RETURN', () => setCancelReturnNumber(returnNumber));
    },
    [guard]
  );

  const handleDownloadInvoice = useCallback(
    (invoice: HubInvoice) => {
      if (!invoice.url) return;
      const url = invoice.url;
      guard('INVOICE', () => window.open(url, '_blank', 'noopener,noreferrer'));
    },
    [guard]
  );

  const handlePayDifference = useCallback(
    (returnNumber: string) => {
      guard('RETURN', async () => {
        try {
          const res = await payExchangeDiff(orderId, returnNumber);
          openRazorpay({
            razorpayOrderId: res.razorpayOrderId,
            amountPaise: Math.round(res.amount * 100),
            name: `Order #${hub?.order.orderNumber ?? orderId.slice(0, 8).toUpperCase()}`,
            description: `Exchange difference · ${returnNumber}`,
            prefill: hub
              ? {
                  name: hub.order.shippingAddress.name ?? undefined,
                  contact: hub.order.shippingAddress.phone ?? undefined,
                }
              : undefined,
            onSuccess: async (payment) => {
              try {
                await verifyExchangeDiffPayment(orderId, returnNumber, {
                  razorpayOrderId: payment.razorpay_order_id,
                  razorpayPaymentId: payment.razorpay_payment_id,
                  razorpaySignature: payment.razorpay_signature,
                });
                toast.success('Payment confirmed.');
                void loadHub();
              } catch {
                toast.error(
                  'We couldn’t confirm the payment. Please check back shortly.'
                );
                void loadHub();
              }
            },
          });
        } catch (err) {
          const code = err instanceof ReturnsApiError ? err.code : 'UNKNOWN';
          toast.error(
            code === 'NOTHING_TO_PAY'
              ? 'There’s nothing left to pay on this request.'
              : 'Couldn’t start the payment. Please try again.'
          );
        }
      });
    },
    [guard, orderId, openRazorpay, hub, loadHub]
  );

  if (status === 'loading') {
    return (
      <Container>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading your order…</p>
        </div>
      </Container>
    );
  }

  if (status === 'error' || !hub) {
    const notFound =
      errorCode === 'ORDER_NOT_FOUND' || errorCode === 'HTTP_404';
    return (
      <Container>
        <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 text-center">
          <h1 className="text-lg font-semibold">
            {notFound ? 'Order not found' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {notFound
              ? 'We couldn’t find an order with that link. Please check the link and try again.'
              : 'We couldn’t load this order right now. Please try again in a moment.'}
          </p>
          {!notFound && (
            <button
              type="button"
              onClick={() => void loadHub()}
              className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Retry
            </button>
          )}
        </div>
      </Container>
    );
  }

  const canStartAnyReturn = hub.items.some((item) => item.canStartReturn);

  return (
    <>
      <Container>
        <div className="mx-auto max-w-3xl space-y-6 py-6">
          {fallbackNotices.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-2">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">
                    A few items changed to a refund
                  </p>
                  <ul className="mt-1 space-y-1">
                    {fallbackNotices.map((n, i) => (
                      <li key={i}>
                        {n.variantLabel
                          ? `${n.variantLabel} (${n.productName})`
                          : n.productName}{' '}
                        went out of stock during submission — converted to an
                        estimated refund of ₹{n.estimatedRefundInr}.
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <HubOrderCard
            order={hub.order}
            invoices={hub.invoices}
            canStartAnyReturn={canStartAnyReturn}
            onViewDetails={() => setOrderDetailOpen(true)}
            onStartReturn={handleStartReturn}
            onDownloadInvoice={handleDownloadInvoice}
            onInvoiceDownload={() =>
              setInvoiceModal({ open: true, purpose: 'INVOICE_DOWNLOAD' })
            }
            onInvoiceEmail={() =>
              setInvoiceModal({ open: true, purpose: 'INVOICE_EMAIL' })
            }
          />

          {/* Items */}
          <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">
              Items in this order
            </h2>
            <div className="mt-1 divide-y divide-border">
              {hub.items.map((item) => (
                <HubItemCard
                  key={item.orderItemId}
                  item={item}
                  onStartReturn={handleStartReturnForItem}
                  onFileComplaint={handleFileComplaint}
                />
              ))}
            </div>
          </section>

          {/* Returns / exchanges / replacements */}
          {hub.returns.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground">
                Returns &amp; exchanges
              </h2>
              {hub.returns.map((ret) => (
                <HubReturnCard
                  key={ret.returnNumber}
                  item={ret}
                  onViewDetail={setDetailReturnNumber}
                  onCancel={handleCancelReturn}
                  onPayDifference={handlePayDifference}
                />
              ))}
            </section>
          )}

          {/* Grievance footer */}
          {hub.meta.grievanceOfficer?.email && (
            <p className="text-center text-xs text-muted-foreground">
              Need help? Contact{' '}
              {hub.meta.grievanceOfficer.name ?? 'our grievance officer'} at{' '}
              <a
                href={`mailto:${hub.meta.grievanceOfficer.email}`}
                className="font-medium underline"
              >
                {hub.meta.grievanceOfficer.email}
              </a>
            </p>
          )}
        </div>
      </Container>

      {/* Step-up + action modals */}
      <OtpModal orderId={orderId} onVerified={handleOtpVerified} />
      <CancelOrderModal
        orderId={orderId}
        open={cancelOrderOpen}
        onClose={() => setCancelOrderOpen(false)}
        onCancelled={() => void loadHub()}
      />
      <CancelReturnModal
        orderId={orderId}
        returnNumber={cancelReturnNumber}
        onClose={() => setCancelReturnNumber(null)}
        onCancelled={() => void loadHub()}
      />
      <ReturnDetailSlideOver
        orderId={orderId}
        returnNumber={detailReturnNumber}
        onClose={() => setDetailReturnNumber(null)}
      />
      <OrderDetailSlideOver
        order={hub.order}
        items={hub.items}
        open={orderDetailOpen}
        onClose={() => setOrderDetailOpen(false)}
        onCancel={() => {
          setOrderDetailOpen(false);
          handleCancelOrder();
        }}
      />
      <InvoiceOtpModal
        orderId={orderId}
        purpose={invoiceModal.purpose}
        open={invoiceModal.open}
        onClose={() => setInvoiceModal((s) => ({ ...s, open: false }))}
      />
    </>
  );
}

const OrderHubClient = ({ orderId }: OrderHubClientProps) => (
  <Suspense
    fallback={
      <Container>
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Container>
    }
  >
    <OrderHubInner orderId={orderId} />
  </Suspense>
);

export default OrderHubClient;
