/**
 * Returns / Exchange / Replacement typed HTTP client.
 *
 * Single source for every returns-flow network call. Rules baked in here so
 * no call site can get them wrong:
 *  - `credentials: 'include'` (default) carries the HttpOnly `order_session_token`
 *    cookie (SameSite=None; Secure) for INVOICE/RETURN-gated endpoints.
 *  - Every non-2xx is normalised into a thrown {@link ReturnsApiError} carrying
 *    the server's `error` code + optional `attemptsLeft`.
 *  - The submit endpoint takes a caller-supplied `X-Submission-Id` (UUID v4) so
 *    retries are idempotent: one id per basket, never regenerated on retry.
 *
 * The backend is law: this layer never computes money or eligibility.
 */

import type {
  AdoptLinkTokenResponse,
  ApiError,
  CancelByCustomerResponse,
  CancelPreviewResponse,
  Capability,
  EligibilityResponse,
  ExchangeOptionsResponse,
  InvoiceEmailResendResponse,
  LogoutResponse,
  PayExchangeDiffResponse,
  PayExchangeDiffVerifyResponse,
  ProductVariantsResponse,
  ProvideReturnEvidenceResponse,
  ReasonsResponse,
  RefundTargetResponse,
  RequestOtpResponse,
  ReturnByNumberResponse,
  RrCancelPreviewResponse,
  RrCancelResponse,
  SubmitBody,
  SubmitResponse,
  TrackingHubResponse,
  VerifyOtpResponse,
} from '@/lib/returns-types';
import { isUploadErrorBody } from '@/lib/uploads/shared/upload-error-codes';
import { API_URL } from '@/lib/api-base';

/** Thrown for any non-2xx response or transport failure. */
export class ReturnsApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly attemptsLeft?: number;
  readonly details?: unknown;
  /** Parsed JSON error body, kept so upload errors can be read by the upload controller. */
  readonly body?: unknown;

  constructor(params: {
    status: number;
    code: string;
    message?: string;
    attemptsLeft?: number;
    details?: unknown;
    body?: unknown;
  }) {
    super(params.message ?? params.code);
    this.name = 'ReturnsApiError';
    this.status = params.status;
    this.code = params.code;
    this.attemptsLeft = params.attemptsLeft;
    this.details = params.details;
    this.body = params.body;
  }

  /** True when the session cookie is missing/expired and a (re)auth is needed. */
  get isAuthError(): boolean {
    return (
      this.status === 401 ||
      this.code === 'CAPABILITY_REQUIRED' ||
      this.code === 'SESSION_EXPIRED' ||
      this.code === 'FORBIDDEN'
    );
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  if (!API_URL) {
    throw new ReturnsApiError({
      status: 0,
      code: 'CONFIG_MISSING',
      message: 'NEXT_PUBLIC_API_URL is not configured',
    });
  }
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    query,
    body,
    headers,
    signal,
    credentials = 'include',
  } = options;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      credentials, // 'include' carries the HttpOnly order_session_token cookie
      cache: 'no-store',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof ReturnsApiError) throw err;
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ReturnsApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
      details: err,
    });
  }

  // 204 / empty body
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload: unknown = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // Upload failures use `{ uploadError: { code, details } }` instead of `{ error }`.
    if (isUploadErrorBody(payload)) {
      throw new ReturnsApiError({
        status: res.status,
        code: payload.uploadError.code,
        details: payload.uploadError.details,
        body: payload,
      });
    }
    const errBody = (payload ?? {}) as Partial<ApiError>;
    throw new ReturnsApiError({
      status: res.status,
      code:
        typeof errBody.error === 'string'
          ? errBody.error
          : `HTTP_${res.status}`,
      attemptsLeft: errBody.attemptsLeft,
      details: errBody.details,
      body: payload,
    });
  }

  // Guard against a 200 response whose body still carries { ok: false, error: '...' }.
  // The HTTP status check above catches most failures; this handles the edge case where
  // the server wraps a business-level error inside a 200 envelope.
  if (
    payload !== null &&
    typeof payload === 'object' &&
    'ok' in payload &&
    (payload as Record<string, unknown>).ok === false
  ) {
    const errBody = payload as Partial<ApiError>;
    throw new ReturnsApiError({
      status: res.status,
      code:
        typeof errBody.error === 'string' ? errBody.error : 'RESPONSE_NOT_OK',
      attemptsLeft: errBody.attemptsLeft,
      details: payload,
      body: payload,
    });
  }

  return payload as T;
}

/* ================================================================== */
/* Tracking hub                                                       */
/* ================================================================== */

export function getTrackingHub(orderId: string, signal?: AbortSignal) {
  return request<TrackingHubResponse>(`/order/${orderId}/tracking-hub`, {
    signal,
  });
}

/* ================================================================== */
/* Auth / session                                                     */
/* ================================================================== */

/** Adopt a magic-link token (?token=...) → sets the session cookie server-side. */
export function adoptLinkToken(orderId: string, token: string) {
  return request<AdoptLinkTokenResponse>(
    `/order/${orderId}/auth/adopt-link-token`,
    {
      method: 'POST',
      body: { token },
    }
  );
}

export function requestOtp(orderId: string, channel: 'phone' | 'email') {
  return request<RequestOtpResponse>(`/order/${orderId}/auth/request-otp`, {
    method: 'POST',
    body: { channel },
  });
}

export function verifyOtp(
  orderId: string,
  code: string,
  capabilitiesRequested: Capability[] = ['INVOICE', 'RETURN']
) {
  return request<VerifyOtpResponse>(`/order/${orderId}/auth/verify-otp`, {
    method: 'POST',
    body: { otp: code, capabilitiesRequested },
  });
}

export function logoutSession(orderId: string) {
  return request<LogoutResponse>(`/order/${orderId}/auth/logout`, {
    method: 'POST',
  });
}

/* ================================================================== */
/* Eligibility / reasons / exchange options                           */
/* ================================================================== */

export function getEligibility(orderId: string, signal?: AbortSignal) {
  return request<EligibilityResponse>(`/order/${orderId}/returns/eligibility`, {
    signal,
  });
}

export function getReasons(
  orderId: string,
  orderItemId: string,
  signal?: AbortSignal
) {
  return request<ReasonsResponse>(`/order/${orderId}/returns/reasons`, {
    query: { orderItemId },
    signal,
  });
}

export function getExchangeOptions(
  orderId: string,
  params: {
    orderItemId: string;
    reasonConfigId: string;
    reasonDetailedId?: string | null;
    intent: 'EXCHANGE' | 'REPLACEMENT';
  },
  signal?: AbortSignal
) {
  return request<ExchangeOptionsResponse>(
    `/order/${orderId}/returns/exchange-options`,
    {
      query: {
        orderItemId: params.orderItemId,
        reasonConfigId: params.reasonConfigId,
        reasonDetailedId: params.reasonDetailedId ?? undefined,
        intent: params.intent,
      },
      signal,
    }
  );
}

/* ================================================================== */
/* Submit (idempotent)                                                */
/* ================================================================== */

/**
 * Submit a return basket. `submissionId` MUST be a stable UUID v4 generated
 * once per basket and reused on every retry — the backend dedupes on it.
 */
export function submitReturns(
  orderId: string,
  submissionId: string,
  body: SubmitBody
) {
  return request<SubmitResponse>(`/order/${orderId}/returns`, {
    method: 'POST',
    headers: { 'X-Submission-Id': submissionId },
    body,
  });
}

/* ================================================================== */
/* Cancel order / refund target / return-by-number                    */
/* ================================================================== */

export function getRefundTarget(orderId: string, signal?: AbortSignal) {
  return request<RefundTargetResponse>(`/order/${orderId}/refund-target`, {
    signal,
  });
}

export function getCancelPreview(orderId: string, signal?: AbortSignal) {
  return request<CancelPreviewResponse>(`/order/${orderId}/cancel-preview`, {
    signal,
  });
}

/** The backend takes one free-text `reason` (max 500 chars). */
function cancelReason(reasonCode: string, reasonText?: string): string {
  return (reasonText ? `${reasonCode}: ${reasonText}` : reasonCode).slice(
    0,
    500
  );
}

export function cancelOrderByCustomer(
  orderId: string,
  reasonCode: string,
  reasonText?: string
) {
  return request<CancelByCustomerResponse>(
    `/order/${orderId}/cancel-by-customer`,
    {
      method: 'POST',
      body: { reason: cancelReason(reasonCode, reasonText) },
    }
  );
}

export function getReturnByNumber(
  orderId: string,
  returnNumber: string,
  signal?: AbortSignal
) {
  return request<ReturnByNumberResponse>(`/returns/by-number/${returnNumber}`, {
    signal,
  });
}

/**
 * Reply to a seller's evidence request. Photos are referenced by the
 * clientKeys of a RETURN_EVIDENCE_RESPONSE upload session, never by URL.
 */
export function provideReturnEvidence(
  orderId: string,
  returnId: string,
  body: {
    responseText?: string | null;
    uploadSessionId?: string | null;
    imageKeys?: string[];
  }
) {
  return request<ProvideReturnEvidenceResponse>(
    `/order/${orderId}/returns/${returnId}/evidence`,
    { method: 'POST', body }
  );
}

export function getReturnCancelPreview(
  orderId: string,
  returnNumber: string,
  signal?: AbortSignal
) {
  return request<RrCancelPreviewResponse>(
    `/returns/by-number/${returnNumber}/cancel-preview`,
    { signal }
  );
}

export function cancelReturn(
  orderId: string,
  returnNumber: string,
  reasonCode: string,
  reasonText?: string
) {
  return request<RrCancelResponse>(
    `/returns/by-number/${returnNumber}/cancel`,
    {
      method: 'POST',
      body: { reason: cancelReason(reasonCode, reasonText) },
    }
  );
}

/* ================================================================== */
/* Retry exchange-difference payment                                  */
/* ================================================================== */

export function payExchangeDiff(orderId: string, returnNumber: string) {
  return request<PayExchangeDiffResponse>('/returns/pay-exchange-diff', {
    method: 'POST',
    body: { returnNumber },
  });
}

export function verifyExchangeDiffPayment(
  orderId: string,
  returnNumber: string,
  payment: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) {
  return request<PayExchangeDiffVerifyResponse>(
    `/returns/pay-exchange-diff/verify`,
    {
      method: 'POST',
      body: {
        returnNumber,
        razorpay_order_id: payment.razorpayOrderId,
        razorpay_payment_id: payment.razorpayPaymentId,
        razorpay_signature: payment.razorpaySignature,
      },
    }
  );
}

/* ================================================================== */
/* Public product variants                                            */
/* ================================================================== */

export function getProductVariants(productId: string, signal?: AbortSignal) {
  return request<ProductVariantsResponse>(`/products/${productId}/variants`, {
    signal,
  });
}

/* ================================================================== */
/* Tax documents: PDF download / email resend (session cookie only)  */
/* ================================================================== */

/** Fetches one tax document PDF (URL comes from the hub's `invoices[]`). */
export async function fetchTaxDocumentPdf(url: string): Promise<Blob> {
  let res: Response;
  try {
    res = await fetch(url, { credentials: 'include', cache: 'no-store' });
  } catch (err) {
    throw new ReturnsApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
      details: err,
    });
  }
  if (!res.ok) {
    throw new ReturnsApiError({
      status: res.status,
      code: `HTTP_${res.status}`,
    });
  }
  return res.blob();
}

/** Emails every tax document of the order to the contact on file. */
export function resendTaxDocuments(
  orderId: string
): Promise<InvoiceEmailResendResponse> {
  return request<InvoiceEmailResendResponse>(
    `/storefront/orders/${orderId}/documents/resend`,
    { method: 'POST', body: {} }
  );
}

/**
 * Type for the optional `buyer` block appended to the checkout POST body
 * when the customer claims a GST tax invoice. Re-exported here so checkout
 * components only need one import point.
 */
export type { BuyerBlock } from '@/lib/returns-types';
