'use client';

import { useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

interface CheckoutProcessingOverlayProps {
  title: string;
  description?: string;
}

const CheckoutProcessingOverlay = ({
  title,
  description,
}: CheckoutProcessingOverlayProps) => {
  useEffect(() => {
    // Background scroll lock
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Payment confirm hote waqt accidental refresh/close se bachao
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, []);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-live="assertive"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-6"
    >
      <div className="max-w-sm text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-gray-900" />
        <h2 className="mt-6 text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        )}
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <span>Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProcessingOverlay;
