'use client';

/**
 * Checkout handoff banner for the unified order page.
 * It is cosmetic and adapts to the backend payment state while the hub polls.
 */

import { Check, CircleAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HubOrder } from '@/lib/returns-types';

interface OrderPlacedBannerProps {
  order: HubOrder;
}

export default function OrderPlacedBanner({ order }: OrderPlacedBannerProps) {
  const pending =
    order.paymentState === 'CONFIRMING' || order.paymentState === 'PENDING';
  const failed =
    order.paymentState === 'FAILED' || order.paymentState === 'REFUNDED';
  const orderNumber = order.orderNumber ?? order.id.slice(0, 8).toUpperCase();

  const Icon = pending ? Loader2 : failed ? CircleAlert : Check;
  const title = pending
    ? 'Payment confirm ho raha hai'
    : failed
      ? 'Payment not completed'
      : 'Order placed';
  const message = pending
    ? 'Aapka order save ho gaya hai. Hum payment confirmation ka status refresh kar rahe hain.'
    : failed
      ? 'This payment could not be completed. Review the status below and contact support if money was deducted.'
      : 'Thank you. We have your order and will show each delivery update here.';

  return (
    <section
      className={cn(
        'flex gap-4 rounded-lg border bg-card p-5',
        failed ? 'border-destructive/40' : 'border-border'
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
          failed
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'border-primary/20 bg-primary/10 text-primary'
        )}
      >
        <Icon
          className={cn('h-5 w-5', pending && 'animate-spin')}
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Order #{orderNumber}
        </p>
        <h1
          className={cn(
            'mt-1 text-lg font-semibold',
            failed ? 'text-destructive' : 'text-foreground'
          )}
        >
          {title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </div>
    </section>
  );
}
