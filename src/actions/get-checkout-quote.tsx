/**
 * Checkout quote client.
 *
 * Asks the store backend for the full price breakdown (goods, shipping, COD fee,
 * GST included or split, total) and a signed quote token. The checkout request must
 * carry that token; the backend recomputes the same numbers, so every amount shown
 * to the buyer comes from here and no tax maths happens in the browser.
 * Used by the checkout page (via use-checkout-quote) and the cart summary.
 */

import { getBuyerFriendlyCheckoutMessage } from '@/lib/checkout-messages';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface QuoteLine {
  productId: string;
  variantId: string | null;
  name: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  gstRate: string | null;
  gstAmount: string;
}

export interface CheckoutQuote {
  quoteToken: string;
  expiresAt: string;
  regime: 'REGULAR' | 'COMPOSITION' | 'UNREGISTERED';
  gstApplies: boolean;
  pricesIncludeTax: boolean;
  paymentMethod: 'PREPAID' | 'COD';
  placeOfSupply: { stateCode: string; stateName: string };
  supplyType: 'INTER_STATE' | 'INTRA_STATE' | 'NONE';
  lines: QuoteLine[];
  subtotal: string;
  shipping: { amount: string; gstAmount: string } | null;
  codFee: { amount: string; gstAmount: string } | null;
  gst: {
    total: string;
    cgst: string;
    sgst: string;
    utgst: string;
    igst: string;
    cess: string;
  };
  total: string;
  buyerGstin: string | null;
}

export interface QuoteItemRequest {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface QuoteRequest {
  items: QuoteItemRequest[];
  shippingAddress: { pincode: string; state: string };
  paymentMethod: 'PREPAID' | 'COD';
  isShippingSameAsBilling?: boolean;
  billingAddress?: { state?: string };
  buyer?: {
    gstin: string;
    legalName: string;
    billingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      pincode: string;
    };
  } | null;
}

export interface QuoteFailure {
  status: number;
  code: string | null;
  message: string;
  details?: Record<string, unknown>;
}

export type QuoteResult =
  | { ok: true; quote: CheckoutQuote }
  | { ok: false; failure: QuoteFailure };

const getCheckoutQuote = async (
  request: QuoteRequest,
  signal?: AbortSignal
): Promise<QuoteResult> => {
  try {
    const res = await fetch(`${API_URL}/checkout/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...request,
        buyer: request.buyer ?? undefined,
      }),
      cache: 'no-store',
      signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const code = typeof body.code === 'string' ? body.code : null;
      const details =
        body.details &&
        typeof body.details === 'object' &&
        !Array.isArray(body.details)
          ? (body.details as Record<string, unknown>)
          : undefined;
      return {
        ok: false,
        failure: {
          status: res.status,
          code,
          message: getBuyerFriendlyCheckoutMessage(
            code,
            body.message ||
              body.error ||
              'We could not calculate your total. Please try again.',
            details,
            'We could not calculate your total. Please try again.'
          ),
          details,
        },
      };
    }
    return { ok: true, quote: body as CheckoutQuote };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error;
    return {
      ok: false,
      failure: {
        status: 0,
        code: null,
        message: 'We could not calculate your total. Please try again.',
      },
    };
  }
};

export default getCheckoutQuote;
