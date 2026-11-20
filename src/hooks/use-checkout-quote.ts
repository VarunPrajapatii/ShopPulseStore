'use client';

/**
 * Live checkout quote for the cart and checkout screens.
 *
 * Re-asks the backend for the quote whenever the cart lines, delivery pincode or State,
 * payment method, GST buyer or separate billing State change (debounced, stale replies
 * dropped). Exposes the latest quote or the failure the backend gave, plus
 * `replaceQuote` for the fresh quote that comes back with a changed-prices response.
 * Used by: checkout page, cart summary.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import getCheckoutQuote, {
  type CheckoutQuote,
  type QuoteFailure,
  type QuoteRequest,
} from '@/actions/get-checkout-quote';

interface UseCheckoutQuoteInput {
  enabled: boolean;
  items: QuoteRequest['items'];
  pincode: string | null | undefined;
  state: string | null | undefined;
  paymentMethod: 'PREPAID' | 'COD';
  buyer?: QuoteRequest['buyer'];
  billingState?: string | null;
}

export default function useCheckoutQuote({
  enabled,
  items,
  pincode,
  state,
  paymentMethod,
  buyer,
  billingState,
}: UseCheckoutQuoteInput) {
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [failure, setFailure] = useState<QuoteFailure | null>(null);
  const [loading, setLoading] = useState(false);

  const request = useMemo<QuoteRequest | null>(() => {
    if (!enabled || items.length === 0 || !pincode || !state) return null;
    return {
      items,
      shippingAddress: { pincode, state },
      paymentMethod,
      ...(billingState
        ? {
            isShippingSameAsBilling: false,
            billingAddress: { state: billingState },
          }
        : {}),
      buyer: buyer ?? null,
    };
  }, [enabled, items, pincode, state, paymentMethod, buyer, billingState]);

  const requestKey = request ? JSON.stringify(request) : null;

  useEffect(() => {
    if (!request) {
      setQuote(null);
      setFailure(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await getCheckoutQuote(request, controller.signal);
        if (result.ok) {
          setQuote(result.quote);
          setFailure(null);
        } else {
          setQuote(null);
          setFailure(result.failure);
        }
        setLoading(false);
      } catch {
        // Aborted by a newer request; that one owns the loading state.
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // requestKey stands in for the request object's identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const replaceQuote = useCallback((fresh: CheckoutQuote) => {
    setQuote(fresh);
    setFailure(null);
  }, []);

  return { quote, failure, loading, replaceQuote };
}
