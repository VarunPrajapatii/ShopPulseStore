'use client';

/**
 * InvoiceOtpModal - self-contained OTP flow for invoice download / email resend.
 *
 * This modal is SEPARATE from OtpModal (the returns capability step-up). Key
 * differences:
 *  - No cookie / capability side-effect. The server returns a short-lived
 *    HMAC token, not a session cookie.
 *  - Email-only channel (SMS not yet available admin-side).
 *  - Supports two purposes:
 *      'INVOICE_DOWNLOAD' on success navigates to downloadUrl immediately.
 *      'INVOICE_EMAIL' on success calls resendInvoiceEmail + fetches masked
 *                           email for the "Sent to …" success screen.
 *  - Anti-enumeration: request-otp always resolves; we show a generic
 *    "If we have your email on file, we've sent a code" message.
 *
 * Props:
 *  orderId   — the order being acted on.
 *  purpose   — 'INVOICE_DOWNLOAD' | 'INVOICE_EMAIL'
 *  open      — visibility toggle controlled by the parent.
 *  onClose   — called when the user dismisses or after a terminal success.
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Loader2, Mail, X } from 'lucide-react';
import toast from 'react-hot-toast';
import IconButton from '@/components/ui/icon-button';
import {
  getContactHints,
  requestInvoiceOtp,
  resendInvoiceEmail,
  ReturnsApiError,
  verifyInvoiceOtp,
} from '@/lib/returns-api';

export type InvoicePurpose = 'INVOICE_DOWNLOAD' | 'INVOICE_EMAIL';

interface InvoiceOtpModalProps {
  orderId: string;
  purpose: InvoicePurpose;
  open: boolean;
  onClose: () => void;
}

/** Inline error copy for verify-otp failure codes. */
const VERIFY_ERROR_COPY: Record<string, string> = {
  INVALID_CODE_FORMAT: 'Enter the 6-digit code.',
  INVALID_OR_EXPIRED: 'Wrong or expired code.',
  TEMPORARY: 'Something went wrong. Please try again.',
};

type Step = 'request' | 'code' | 'success';

const InvoiceOtpModal: React.FC<InvoiceOtpModalProps> = ({
  orderId,
  purpose,
  open,
  onClose,
}) => {
  const [step, setStep] = useState<Step>('request');
  const [code, setCode] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  /** Masked email to show in the success screen (INVOICE_EMAIL purpose only). */
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);

  // Reset all local state whenever the modal closes.
  useEffect(() => {
    if (!open) {
      setStep('request');
      setCode('');
      setRequesting(false);
      setVerifying(false);
      setCooldown(0);
      setAttemptsLeft(null);
      setInlineError(null);
      setMaskedEmail(null);
    }
  }, [open]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleRequestOtp = async () => {
    setRequesting(true);
    setInlineError(null);
    try {
      await requestInvoiceOtp(orderId);
      // Anti-enumeration: always show the same message regardless of outcome.
      setStep('code');
      setCooldown(30);
    } catch {
      // Even on network error we move to code step with a generic message.
      setStep('code');
      setCooldown(30);
    } finally {
      setRequesting(false);
    }
  };

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setInlineError('Enter the 6-digit code.');
      return;
    }
    setVerifying(true);
    setInlineError(null);
    try {
      const res = await verifyInvoiceOtp(orderId, trimmed);

      if (purpose === 'INVOICE_DOWNLOAD') {
        window.open(res.downloadUrl, '_blank', 'noopener,noreferrer');
        onClose();
        return;
      }

      // INVOICE_EMAIL: call email-resend, then optionally fetch masked hint.
      await resendInvoiceEmail(orderId, res.token).catch(() => {
        // Non-fatal: always-200 endpoint; failure is logged server-side.
      });

      try {
        const hints = await getContactHints(orderId, res.token);
        setMaskedEmail(hints.emailMask);
      } catch {
        setMaskedEmail(null);
      }

      setStep('success');
    } catch (err) {
      const errCode = err instanceof ReturnsApiError ? err.code : 'TEMPORARY';
      const left =
        err instanceof ReturnsApiError ? err.attemptsLeft : undefined;
      if (left !== undefined) setAttemptsLeft(left);
      const msg =
        (VERIFY_ERROR_COPY[errCode] ??
          'Something went wrong. Please try again.') +
        (errCode === 'INVALID_OR_EXPIRED' && left !== undefined
          ? ` ${left} attempt${left === 1 ? '' : 's'} left.`
          : '');
      setInlineError(msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setInlineError(null);
    setCode('');
    setAttemptsLeft(null);
    setCooldown(30);
    try {
      await requestInvoiceOtp(orderId);
    } catch {
      // Anti-enumeration: ignore.
    }
    toast.success('If we have your email on file, a new code has been sent.');
  };

  const title =
    purpose === 'INVOICE_DOWNLOAD'
      ? 'Download tax invoice'
      : 'Email invoice to me';

  return (
    <Transition show={open} appear as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all">
                <div className="absolute right-4 top-4">
                  <IconButton onClick={onClose} icon={<X size={15} />} />
                </div>

                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {title}
                </Dialog.Title>

                {/* ── Step 1: request ── */}
                {step === 'request' && (
                  <div className="mt-4">
                    <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        We&apos;ll send a 6-digit verification code to the email
                        address on file for this order.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRequestOtp()}
                      disabled={requesting}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {requesting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Send code
                    </button>
                    <p className="mt-3 text-center text-xs text-muted-foreground">
                      If we have your email on file for this order, we&apos;ll
                      receive a code shortly.
                    </p>
                  </div>
                )}

                {/* ── Step 2: enter code ── */}
                {step === 'code' && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      If we have your email on file for this order, we&apos;ve
                      sent a 6-digit code.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, ''));
                        setInlineError(null);
                      }}
                      placeholder="------"
                      className="mt-4 w-full rounded-xl border border-border bg-white px-4 py-3 text-center text-2xl font-mono font-semibold tracking-[0.5em] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label="6-digit verification code"
                      autoFocus
                    />

                    {inlineError && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {inlineError}
                        {attemptsLeft !== null && attemptsLeft <= 2 && (
                          <span className="ml-1 text-muted-foreground">
                            ({attemptsLeft} attempt
                            {attemptsLeft === 1 ? '' : 's'} left)
                          </span>
                        )}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleVerify()}
                      disabled={verifying || code.trim().length !== 6}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {verifying && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Verify
                    </button>

                    <div className="mt-3 text-center">
                      {cooldown > 0 ? (
                        <p className="text-xs text-muted-foreground">
                          Resend in {cooldown}s
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void handleResend()}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Resend code
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Step 3: success (INVOICE_EMAIL only) ── */}
                {step === 'success' && (
                  <div className="mt-4 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      Invoice sent!
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {maskedEmail ? (
                        <>
                          Sent to{' '}
                          <span className="font-medium text-foreground">
                            {maskedEmail}
                          </span>
                          . Check your inbox.
                        </>
                      ) : (
                        'Sent to your email on file. Check your inbox.'
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                    >
                      Done
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceOtpModal;
