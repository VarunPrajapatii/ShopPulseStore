'use client';

import { cn } from '@/lib/utils';

/**
 * StatusBadge — a small pill for order / return statuses. Tone is derived from
 * the status string so unknown future statuses still render gracefully (neutral).
 */

type Tone = 'neutral' | 'info' | 'progress' | 'success' | 'danger' | 'warning';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-blue-50 text-blue-700',
  progress: 'bg-amber-50 text-amber-700',
  success: 'bg-green-50 text-green-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-orange-50 text-orange-700',
};

const STATUS_TONE: Record<string, Tone> = {
  // order
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'progress',
  SHIPPED: 'progress',
  OUT_FOR_DELIVERY: 'progress',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  CANCELLATION_PENDING: 'warning',
  REFUNDED: 'neutral',
  // return
  PENDING_PAYMENT: 'warning',
  REQUESTED: 'info',
  APPROVED: 'info',
  REJECTED: 'danger',
  PICKUP_SCHEDULED: 'progress',
  PICKED_UP: 'progress',
  RECEIVED: 'progress',
  INSPECTED: 'progress',
  REFUND_INITIATED: 'progress',
  COMPLETED: 'success',
};

function humanize(status: string): string {
  return status
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const tone = STATUS_TONE[status] ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONE_CLASSES[tone],
        className
      )}
    >
      {humanize(status)}
    </span>
  );
};

export default StatusBadge;
