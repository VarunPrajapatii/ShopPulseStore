'use client';

/**
 * OtpModal - capability step-up for the open tracking hub.
 *
 * Order-ID-search visitors arrive with no capabilities (empty cookie). When they
 * attempt a gated action (cancel, start return, invoice), the hub opens this
 * modal to verify identity via OTP. Magic-link visitors already hold capabilities
 * in their cookie and never see this.
 *
 * Flow: pick channel (phone/email) -> request OTP (with resend cooldown) ->
 * enter 6-digit code -> verify. On success the new capabilities and expiry are
 * mirrored into the session store so the parent can resume the pending action.
 */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Loader2, Mail, Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import IconButton from '@/components/ui/icon-button';
import { requestOtp, ReturnsApiError, verifyOtp } from '@/lib/returns-api';
import type { Capability } from '@/lib/returns-types';
import useOrderSession from '@/hooks/use-order-session';

interface OtpModalProps {
  orderId: string;
  onVerified: (capabilities: Capability[]) => void;
}

type Channel = 'phone' | 'email';

const OtpModal: React.FC<OtpModalProps> = ({ orderId, onVerified }) => {
  const isOpen = useOrderSession((s) => s.isOtpModalOpen);
  const closeOtpModal = useOrderSession((s) => s.closeOtpModal);
  const setCookieCapabilities = useOrderSession((s) => s.setCookieCapabilities);

  const [step, setStep] = useState<'channel' | 'code'>('channel');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [masked, setMasked] = useState<string>('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  // Reset internal state whenever the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setStep('channel');
      setChannel(null);
      setMasked('');
      setCode('');
      setSubmitting(false);
      setCooldown(0);
      setAttemptsLeft(null);
    }
  }, [isOpen]);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleRequest = async (selected: Channel) => {
    setSubmitting(true);
    try {
      const res = await requestOtp(orderId, selected);
      setChannel(selected);
      setMasked(res.masked);
      setCooldown(res.cooldownSec ?? 30);
      setStep('code');
      setCode('');
      toast.success(`OTP sent to ${res.masked}`);
    } catch (err) {
      const code = err instanceof ReturnsApiError ? err.code : 'UNKNOWN';
      toast.error(
        code === 'OTP_RATE_LIMITED'
          ? 'Too many attempts. Please wait a moment and try again.'
          : 'Couldn’t send the code. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error('Please enter the 6-digit code.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await verifyOtp(orderId, code);
      setCookieCapabilities(res.capabilities, res.expiresAt);
      const remainingMs = new Date(res.expiresAt).getTime() - Date.now();
      if (remainingMs < 5 * 60 * 1000) {
        toast('Your session will expire soon. Please complete your action.');
      }
      toast.success('Verified successfully.');
      closeOtpModal();
      onVerified(res.capabilities);
    } catch (err) {
      if (err instanceof ReturnsApiError) {
        if (typeof err.attemptsLeft === 'number')
          setAttemptsLeft(err.attemptsLeft);
        toast.error(
          err.code === 'OTP_EXPIRED'
            ? 'That code expired. Please request a new one.'
            : 'Incorrect code. Please try again.'
        );
      } else {
        toast.error('Verification failed. Please try again.');
      }
      setCode('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Transition show={isOpen} appear as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={closeOtpModal}>
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
                  <IconButton onClick={closeOtpModal} icon={<X size={15} />} />
                </div>

                <Dialog.Title className="text-lg font-semibold text-foreground">
                  Verify it’s you
                </Dialog.Title>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step === 'channel'
                    ? 'To protect your order, choose where we should send a one-time code.'
                    : `Enter the 6-digit code we sent to ${masked}.`}
                </p>

                {step === 'channel' ? (
                  <div className="mt-5 grid gap-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRequest('phone')}
                      className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary disabled:opacity-50"
                    >
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-foreground">
                          Text me an OTP
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Sent to the phone on this order
                        </span>
                      </span>
                      {submitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleRequest('email')}
                      className="flex items-center gap-3 rounded-xl border border-border p-4 text-left transition hover:border-primary disabled:opacity-50"
                    >
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span className="flex-1">
                        <span className="block text-sm font-semibold text-foreground">
                          Email me an OTP
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          Sent to the email on this order
                        </span>
                      </span>
                      {submitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="••••••"
                      className="w-full rounded-xl border border-border px-4 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-primary"
                    />
                    {attemptsLeft !== null && (
                      <p className="mt-2 text-xs text-red-600">
                        {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'}{' '}
                        left.
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={submitting || code.length !== 6}
                      onClick={handleVerify}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      Verify
                    </button>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => setStep('channel')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Change method
                      </button>
                      <button
                        type="button"
                        disabled={cooldown > 0 || submitting || !channel}
                        onClick={() => channel && handleRequest(channel)}
                        className="font-semibold text-primary disabled:text-muted-foreground"
                      >
                        {cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : 'Resend code'}
                      </button>
                    </div>
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

export default OtpModal;
