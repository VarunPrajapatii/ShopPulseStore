'use client';

/**
 * Level 0 access prompt for the unified order page.
 * Verification remains server-backed through the existing OTP modal flow.
 */

import { LockKeyhole } from 'lucide-react';

interface OrderAccessCardProps {
  onVerify: () => void;
}

export default function OrderAccessCard({ onVerify }: OrderAccessCardProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
          <LockKeyhole className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-foreground">
            Poori details, invoice aur returns ke liye verify karo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify once to unlock full contact details, invoice downloads, and
            return or cancellation actions for this order.
          </p>
          <button
            type="button"
            onClick={onVerify}
            className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Verify with OTP
          </button>
        </div>
      </div>
    </section>
  );
}
