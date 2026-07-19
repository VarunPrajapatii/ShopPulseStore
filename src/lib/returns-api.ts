/**
 * Returns / Exchange / Replacement typed HTTP client.
 *
 * Single source for every returns-flow network call. Rules baked in here so
 * no call site can get them wrong:
 *  - ALWAYS `credentials: 'include'` carries the HttpOnly `order_session_token`
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
  ContactHintsResponse,
  EligibilityResponse,
  ExchangeOptionsResponse,
  InvoiceEmailResendResponse,
  InvoiceRequestOtpResponse,
  InvoiceVerifyOtpResponse,
  LogoutResponse,
  PayExchangeDiffResponse,
  PayExchangeDiffVerifyResponse,
  ProductVariantsResponse,
  ReasonsResponse,
  RefundTargetInput,
  RefundTargetResponse,
  RequestOtpResponse,
  ReturnByNumberResponse,
  RrCancelPreviewResponse,
  RrCancelResponse,
  SubmitBody,
  SubmitResponse,
  TrackingHubResponse,
  UploadPhotoResponse,
  VerifyOtpResponse,
} from '@/lib/returns-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Thrown for any non-2xx response or transport failure. */
export class ReturnsApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly attemptsLeft?: number;
  readonly details?: unknown;

  constructor(params: {
    status: number;
    code: string;
    message?: string;
    attemptsLeft?: number;
    details?: unknown;
  }) {
    super(params.message ?? params.code);
    this.name = 'ReturnsApiError';
    this.status = params.status;
    this.code = params.code;
    this.attemptsLeft = params.attemptsLeft;
    this.details = params.details;
  }

  /** True when the session cookie is missing/expired and a (re)auth is needed. */
  get isAuthError(): boolean {
    return (
      this.status === 401 ||
      this.code === 'CAPABILITY_REQUIRED' ||
      this.code === 'SESSION_EXPIRED'
    );
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
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
  const { method = 'GET', query, body, headers, signal } = options;

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      credentials: 'include', // carry the HttpOnly order_session_token cookie
      cache: 'no-store',
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
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
    const errBody = (payload ?? {}) as Partial<ApiError>;
    throw new ReturnsApiError({
      status: res.status,
      code:
        typeof errBody.error === 'string'
          ? errBody.error
          : `HTTP_${res.status}`,
      attemptsLeft: errBody.attemptsLeft,
      details: errBody.details,
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
      details: payload,
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

export function verifyOtp(orderId: string, code: string) {
  return request<VerifyOtpResponse>(`/order/${orderId}/auth/verify-otp`, {
    method: 'POST',
    body: { otp: code, capabilitiesRequested: ['INVOICE', 'RETURN'] },
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

export function saveRefundTarget(orderId: string, target: RefundTargetInput) {
  return request<RefundTargetResponse>(`/order/${orderId}/refund-target`, {
    method: 'POST',
    body: target,
  });
}

export function getCancelPreview(orderId: string, signal?: AbortSignal) {
  return request<CancelPreviewResponse>(`/order/${orderId}/cancel-preview`, {
    signal,
  });
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
      body: { reasonCode, reasonText: reasonText ?? null },
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
      body: { reasonCode, reasonText: reasonText ?? null },
    }
  );
}

/* ================================================================== */
/* Retry exchange-difference payment                                  */
/* ================================================================== */

export function payExchangeDiff(orderId: string, returnNumber: string) {
  return request<PayExchangeDiffResponse>(
    `/returns/pay-exchange-diff?returnNumber=${returnNumber}`,
    { method: 'POST' }
  );
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
    { method: 'POST', body: payment }
  );
}

/* ================================================================== */
/* Photo upload                                                       */
/* ================================================================== */

export interface UploadSignatureBody {
  orderItemId: string;
  unitIndex: number;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

/** Step 1: ask our API for a scoped Cloudinary upload signature. */
export function getUploadSignature(orderId: string, body: UploadSignatureBody) {
  return request<UploadPhotoResponse>(
    `/order/${orderId}/returns/upload-photo`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * Full photo upload: request a signature, then POST the file directly to
 * Cloudinary with the returned fields. Returns the Cloudinary `secure_url` to
 * stash in the slice's `photos[]`. Cloudinary is a third-party origin, so that
 * leg does NOT send our cookie.
 */
export async function uploadReturnPhoto(
  orderId: string,
  params: { orderItemId: string; unitIndex: number; file: File }
): Promise<string> {
  const { orderItemId, unitIndex, file } = params;
  const signature = await getUploadSignature(orderId, {
    orderItemId,
    unitIndex,
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
  });

  const formData = new FormData();
  for (const [key, value] of Object.entries(signature.fields)) {
    formData.append(key, String(value));
  }
  formData.append('file', file);

  let res: Response;
  try {
    res = await fetch(signature.uploadUrl, { method: 'POST', body: formData });
  } catch (err) {
    throw new ReturnsApiError({
      status: 0,
      code: 'UPLOAD_NETWORK_ERROR',
      message: 'Photo upload failed',
      details: err,
    });
  }

  if (!res.ok) {
    throw new ReturnsApiError({
      status: res.status,
      code: 'UPLOAD_FAILED',
      message: 'Cloudinary rejected the upload',
    });
  }

  const data = (await res.json().catch(() => null)) as {
    secure_url?: string;
  } | null;
  if (!data?.secure_url) {
    throw new ReturnsApiError({
      status: 0,
      code: 'UPLOAD_NO_URL',
      message: 'No secure_url returned',
    });
  }
  return data.secure_url;
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
/* Tax invoice OTP-gated PDF download / email resend                  */
/* ================================================================== */

/**
 * The invoice endpoints are under a different URL base than the returns API:
 *   /api/{storeId}/storefront/orders/{orderId}/invoice/...
 *
 * `NEXT_PUBLIC_STORE_ID` identifies the store. These endpoints do NOT carry
 * the `order_session_token` cookie (they're public, token-gated). We still
 * send credentials:'include' (harmless) because `request<T>()` always does.
 */
function invoicePath(orderId: string, suffix: string): string {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID;
  if (!storeId) {
    throw new ReturnsApiError({
      status: 0,
      code: 'CONFIG_MISSING',
      message: 'NEXT_PUBLIC_STORE_ID is not configured',
    });
  }
  return `/api/${storeId}/storefront/orders/${orderId}/invoice${suffix}`;
}

/**
 * Request a 6-digit invoice OTP.
 *
 * Always resolves (anti-enumeration: server returns `{ ok: true }` whether or
 * not an email was sent). Show the user a generic "If we have your email on
 * file, we've sent a code" message; never reveal order existence.
 */
export function requestInvoiceOtp(
  orderId: string
): Promise<InvoiceRequestOtpResponse> {
  return request<InvoiceRequestOtpResponse>(
    invoicePath(orderId, '/request-otp'),
    {
      method: 'POST',
    }
  );
}

/**
 * Verify the 6-digit invoice OTP.
 *
 * On success returns a short-lived (5 min) `token` and a fully-formed
 * `downloadUrl`. Navigate to `downloadUrl` to trigger the PDF download.
 * On failure throws `ReturnsApiError` with:
 *   - `code: 'INVALID_CODE_FORMAT'`  → "Enter the 6-digit code."
 *   - `code: 'INVALID_OR_EXPIRED'`   → "Wrong or expired code. {attemptsLeft} attempts left."
 *   - `code: 'TEMPORARY'`            → "Something went wrong. Please try again."
 *
 * Never retry automatically on failure (anti-enumeration).
 */
export function verifyInvoiceOtp(
  orderId: string,
  code: string
): Promise<InvoiceVerifyOtpResponse> {
  return request<InvoiceVerifyOtpResponse>(
    invoicePath(orderId, '/verify-otp'),
    {
      method: 'POST',
      body: { code },
    }
  );
}

/**
 * Re-send the invoice email with the PDF attachment and a 90-day
 * re-download link button to the order's email on file.
 *
 * Requires the short-lived `token` from a fresh `verifyInvoiceOtp` call
 * (within its 5-minute window). Long-lived tokens are rejected.
 *
 * Always resolves with `{ ok: true }` (anti-enumeration); the send is
 * best-effort server-side.
 */
export function resendInvoiceEmail(
  orderId: string,
  token: string
): Promise<InvoiceEmailResendResponse> {
  return request<InvoiceEmailResendResponse>(
    invoicePath(orderId, '/email-resend'),
    {
      method: 'POST',
      body: { token },
    }
  );
}

/**
 * Fetch a masked email hint (e.g. `al••@gmail.com`) to display in the
 * "Sent to …" success screen after `INVOICE_EMAIL` OTP success.
 *
 * Requires the short-lived `token` from the same `verifyInvoiceOtp` call.
 * Returns `{ ok: true, emailMask: null }` when the token is bad/expired or
 * no email is on file — callers must fall back to generic copy in that case.
 */
export function getContactHints(
  orderId: string,
  token: string
): Promise<ContactHintsResponse> {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID;
  if (!storeId) {
    throw new ReturnsApiError({
      status: 0,
      code: 'CONFIG_MISSING',
      message: 'NEXT_PUBLIC_STORE_ID is not configured',
    });
  }
  return request<ContactHintsResponse>(
    `/api/${storeId}/storefront/orders/${orderId}/contact-hints`,
    {
      query: { token },
    }
  );
}

/**
 * Type for the optional `buyer` block appended to the checkout POST body
 * when the customer claims a GST tax invoice. Re-exported here so checkout
 * components only need one import point.
 */
export type { BuyerBlock } from '@/lib/returns-types';
