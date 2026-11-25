'use client';

/**
 * Shared order price breakdown for the unified order hub and detail panel.
 * It renders backend-provided decimal strings without recomputing order money.
 */

import Currency from '@/components/ui/currency';
import type { HubOrder } from '@/lib/returns-types';

interface OrderPriceBreakdownProps {
  order: HubOrder;
}

export default function OrderPriceBreakdown({
  order,
}: OrderPriceBreakdownProps) {
  const hasItemDiscount = Number(order.discountInr) > 0;
  const couponInr = order.couponInr ?? '0.00';
  const hasCoupon = Number(couponInr) > 0;
  const hasCodCharge = Number(order.codChargeInr) > 0;
  const hasTax = Number(order.taxInr) > 0;
  const totalLabel =
    order.paymentState === 'PAID'
      ? 'Paid'
      : order.paymentState === 'PAY_ON_DELIVERY'
        ? 'Pay on delivery'
        : order.paymentState === 'CONFIRMING'
          ? 'Payment pending'
          : 'Order total';

  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Subtotal</dt>
        <dd>
          <Currency
            amount={order.subtotalInr}
            className="text-sm font-medium"
          />
        </dd>
      </div>
      {hasItemDiscount && (
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Product discount</dt>
          <dd className="text-sm font-medium text-foreground">
            -
            <Currency amount={order.discountInr} className="text-sm" />
          </dd>
        </div>
      )}
      {hasCoupon && (
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">Coupon discount</dt>
          <dd className="text-sm font-medium text-foreground">
            -
            <Currency amount={couponInr} className="text-sm" />
          </dd>
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Shipping</dt>
        <dd>
          <Currency
            amount={order.shippingInr}
            className="text-sm font-medium"
          />
        </dd>
      </div>
      {hasCodCharge && (
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">COD charge</dt>
          <dd>
            <Currency
              amount={order.codChargeInr}
              className="text-sm font-medium"
            />
          </dd>
        </div>
      )}
      {hasTax && (
        <div className="flex items-center justify-between gap-4">
          <dt className="text-muted-foreground">GST total</dt>
          <dd>
            <Currency amount={order.taxInr} className="text-sm font-medium" />
          </dd>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 border-t border-border pt-2">
        <dt className="font-semibold text-foreground">{totalLabel}</dt>
        <dd>
          <Currency amount={order.paidInr} className="text-base" />
        </dd>
      </div>
    </dl>
  );
}
