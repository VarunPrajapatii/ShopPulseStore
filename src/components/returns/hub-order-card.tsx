'use client';

/**
 * HubOrderCard — the order summary header on the tracking hub.
 *
 * Renders the order identity, status, money breakdown, and shipping address,
 * plus the three primary CTAs. CTA visibility is driven STRICTLY by server
 * truth — Cancel shows only when `order.canCancel`; Invoice only when an ORDER
 * invoice with a non-null URL exists (v1: url is null → hidden). Start-a-return
 * shows only when the caller reports at least one returnable item.
 */

import { FileText, Mail, MapPin, PanelRightOpen } from 'lucide-react';
import Currency from '@/components/ui/currency';
import StatusBadge from '@/components/returns/status-badge';
import type { HubInvoice, HubOrder } from '@/lib/returns-types';

interface HubOrderCardProps {
  order: HubOrder;
  invoices: HubInvoice[];
  canStartAnyReturn: boolean;
  onViewDetails: () => void;
  onStartReturn: () => void;
  onDownloadInvoice: (invoice: HubInvoice) => void;
  /** Opened when the user wants to download the tax invoice PDF (OTP-gated). */
  onInvoiceDownload: () => void;
  /** Opened when the user wants the invoice re-sent to their email (OTP-gated). */
  onInvoiceEmail: () => void;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const HubOrderCard: React.FC<HubOrderCardProps> = ({
  order,
  invoices,
  canStartAnyReturn,
  onViewDetails,
  onStartReturn,
  onDownloadInvoice,
  onInvoiceDownload,
  onInvoiceEmail,
}) => {
  // Legacy direct-URL invoice (non-null url) — used for RETURN invoices where
  // the admin embeds a pre-signed link directly in the hub response.
  const orderInvoice = invoices.find((inv) => inv.kind === 'ORDER' && inv.url);
  // Tax invoice: show OTP-gated CTAs when invoiceNumber is set on the order
  // Visibility trigger is invoiceNumber, not a pre-signed URL.
  const hasInvoice = !!order.invoiceNumber;
  const placedOn = formatDate(order.placedAt);
  const hasCoupon = Number(order.couponInr) > 0;
  const addr = order.shippingAddress;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Order
          </p>
          <h1 className="text-lg font-semibold text-foreground">
            #{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}
          </h1>
          {placedOn && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Placed on {placedOn}
            </p>
          )}
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Money breakdown */}
      <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>
            <Currency
              amount={order.subtotalInr}
              className="text-sm font-medium"
            />
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>
            <Currency
              amount={order.shippingInr}
              className="text-sm font-medium"
            />
          </dd>
        </div>
        {hasCoupon && (
          <div className="flex items-center justify-between text-green-700">
            <dt>Coupon discount</dt>
            <dd className="text-sm font-medium">
              −
              <Currency
                amount={order.couponInr}
                className="text-sm font-medium text-green-700"
              />
            </dd>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-border pt-2">
          <dt className="font-semibold text-foreground">
            {order.isPaid ? 'Paid' : 'Amount'}
          </dt>
          <dd>
            <Currency amount={order.paidInr} className="text-base" />
          </dd>
        </div>
      </dl>

      {/* Shipping address */}
      {(addr.line1 || addr.city) && (
        <div className="mt-4 flex gap-2 rounded-xl bg-muted/50 p-3 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <address className="not-italic text-muted-foreground">
            {addr.name && (
              <span className="font-medium text-foreground">{addr.name}</span>
            )}
            {addr.name && <br />}
            {[addr.line1, addr.line2].filter(Boolean).join(', ')}
            {addr.line1 && <br />}
            {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
            {addr.phone && (
              <>
                <br />
                {addr.phone}
              </>
            )}
          </address>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {canStartAnyReturn && (
          <button
            type="button"
            onClick={onStartReturn}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground btn-press"
          >
            Return or exchange
          </button>
        )}
        {orderInvoice && (
          <button
            type="button"
            onClick={() => onDownloadInvoice(orderInvoice)}
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary"
          >
            <FileText className="h-4 w-4" />
            {orderInvoice.label || 'Invoice'}
          </button>
        )}
        {hasInvoice && (
          <>
            <button
              type="button"
              onClick={onInvoiceDownload}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary"
            >
              <FileText className="h-4 w-4" />
              Download invoice
            </button>
            <button
              type="button"
              onClick={onInvoiceEmail}
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary"
            >
              <Mail className="h-4 w-4" />
              Email invoice
            </button>
          </>
        )}
        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary"
        >
          <PanelRightOpen className="h-4 w-4" />
          Order details
        </button>
      </div>
    </section>
  );
};

export default HubOrderCard;
