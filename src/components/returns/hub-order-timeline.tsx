'use client';

/**
 * Accessible vertical forward-order timeline for the unified order hub.
 * Rendering is driven only by backend-provided states and timestamps.
 */

import {
  Check,
  CircleDot,
  CreditCard,
  MapPin,
  Package,
  PackageCheck,
  Truck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  HubOrderTimelineEntry,
  HubOrderTimelineKey,
} from '@/lib/returns-types';

interface HubOrderTimelineProps {
  entries: HubOrderTimelineEntry[];
}

const ICONS: Record<
  HubOrderTimelineKey,
  React.ComponentType<{ className?: string }>
> = {
  ORDER_PLACED: Package,
  PAYMENT_CONFIRMED: CreditCard,
  PROCESSING: PackageCheck,
  SHIPPED: Truck,
  IN_TRANSIT: Truck,
  OUT_FOR_DELIVERY: MapPin,
  DELIVERED: Check,
  PAYMENT_FAILED: X,
  DELIVERY_FAILED: X,
  CANCELLED: X,
  REFUNDED: X,
};

function formatTimestamp(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HubOrderTimeline({ entries }: HubOrderTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground">Order timeline</h2>
      <ol className="mt-5">
        {entries.map((entry, index) => {
          const Icon = ICONS[entry.key];
          const isLast = index === entries.length - 1;
          const timestamp = formatTimestamp(entry.timestamp);
          const isCurrent = entry.state === 'current';
          const isDone = entry.state === 'done';
          const isFailed = entry.state === 'failed';

          return (
            <li
              key={`${entry.key}-${index}`}
              className={cn('relative flex gap-3', !isLast && 'pb-5')}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {!isLast && (
                <span
                  className={cn(
                    'absolute bottom-0 left-[13px] top-7 w-px',
                    isDone ? 'bg-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
                  isDone && 'border-primary bg-primary text-primary-foreground',
                  isCurrent &&
                    'border-primary bg-card text-primary ring-4 ring-primary/10',
                  entry.state === 'upcoming' &&
                    'border-border bg-card text-muted-foreground',
                  isFailed &&
                    'border-destructive bg-destructive text-destructive-foreground'
                )}
                aria-hidden="true"
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isCurrent ? (
                  <CircleDot className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isFailed
                      ? 'text-destructive'
                      : entry.state === 'upcoming'
                        ? 'text-muted-foreground'
                        : 'text-foreground'
                  )}
                >
                  {entry.label}
                </p>
                {timestamp && (
                  <time
                    dateTime={entry.timestamp ?? undefined}
                    className="mt-0.5 block text-xs text-muted-foreground"
                  >
                    {timestamp}
                  </time>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
