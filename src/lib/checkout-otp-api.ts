import { API_URL } from '@/lib/api-base';

export class CheckoutOtpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly attemptsLeft?: number;
  readonly cooldownSeconds?: number;

  constructor(p: {
    status: number;
    code: string;
    attemptsLeft?: number;
    cooldownSeconds?: number;
  }) {
    super(p.code);
    this.name = 'CheckoutOtpError';
    this.status = p.status;
    this.code = p.code;
    this.attemptsLeft = p.attemptsLeft;
    this.cooldownSeconds = p.cooldownSeconds;
  }
}

/** Last 10 digits, same rule as the backend. */
export const normalizeIndianPhone = (raw: string) =>
  raw.replace(/\D/g, '').slice(-10);

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!API_URL)
    throw new CheckoutOtpError({ status: 0, code: 'CONFIG_MISSING' });

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
      credentials: 'omit', // checkout API answers with wildcard CORS
    });
  } catch {
    throw new CheckoutOtpError({ status: 0, code: 'NETWORK_ERROR' });
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.ok === false) {
    throw new CheckoutOtpError({
      status: res.status,
      code: typeof data?.error === 'string' ? data.error : `HTTP_${res.status}`,
      attemptsLeft: data?.attemptsLeft,
      cooldownSeconds: data?.cooldownSeconds,
    });
  }
  return data as T;
}

export interface CheckoutOtpRequestResponse {
  ok: true;
  masked: string;
  cooldownSeconds: number;
  expiresIn: number;
}

export interface CheckoutOtpVerifyResponse {
  ok: true;
  checkoutAuthToken: string;
  expiresAt: string;
}

export const requestCheckoutOtp = (phone: string) =>
  post<CheckoutOtpRequestResponse>('/checkout/otp/request', { phone });

export const verifyCheckoutOtp = (phone: string, code: string) =>
  post<CheckoutOtpVerifyResponse>('/checkout/otp/verify', { phone, code });
