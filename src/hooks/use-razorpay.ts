'use client';

/**
 * useRazorpay — loads the Razorpay Checkout script once and exposes a typed
 * `open()` helper for the returns exchange-difference payment flow.
 *
 * Settlement contract: prefer `settlement.keyId` from the API over
 * NEXT_PUBLIC_RAZORPAY_KEY_ID. Never auto-open — only open in response to a
 * deliberate user action on the settlement screen.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOpenOptions {
  /** Razorpay key id. Prefer settlement.keyId; fall back to env. */
  keyId?: string | null;
  /** Razorpay order id from the API. */
  razorpayOrderId: string;
  /** Amount in paise. Convert at the boundary: Math.round(Number(rupees) * 100). */
  amountPaise: number;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  themeColor?: string;
  onSuccess: (response: RazorpayCheckoutResponse) => void;
  onDismiss?: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
}

interface RazorpayInstance {
  open: () => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

/** Read window.Razorpay without a global augmentation (avoids declaration clashes). */
function getRazorpayCtor(): RazorpayConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay;
}

type ScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useRazorpay() {
  const [status, setStatus] = useState<ScriptStatus>('idle');
  const statusRef = useRef<ScriptStatus>('idle');
  statusRef.current = status;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (getRazorpayCtor()) {
      setStatus('ready');
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`
    );

    const handleLoad = () => setStatus('ready');
    const handleError = () => setStatus('error');

    if (existing) {
      if (existing.dataset.loaded === 'true') {
        setStatus('ready');
      } else {
        setStatus('loading');
        existing.addEventListener('load', handleLoad);
        existing.addEventListener('error', handleError);
      }
      return () => {
        existing.removeEventListener('load', handleLoad);
        existing.removeEventListener('error', handleError);
      };
    }

    setStatus('loading');
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      handleLoad();
    });
    script.addEventListener('error', handleError);
    document.body.appendChild(script);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, []);

  const open = useCallback((options: RazorpayOpenOptions) => {
    const RazorpayCtor = getRazorpayCtor();
    if (!RazorpayCtor) {
      throw new Error('Razorpay is not ready yet');
    }
    const key = options.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
    const rzp = new RazorpayCtor({
      key,
      amount: options.amountPaise,
      currency: 'INR',
      name: options.name,
      description: options.description,
      order_id: options.razorpayOrderId,
      prefill: options.prefill,
      theme: options.themeColor ? { color: options.themeColor } : undefined,
      handler: options.onSuccess,
      modal: options.onDismiss ? { ondismiss: options.onDismiss } : undefined,
    });
    rzp.open();
  }, []);

  return { status, isReady: status === 'ready', open };
}
