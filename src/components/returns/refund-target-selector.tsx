'use client';

/**
 * RefundTargetSelector - refund destination editor for the review screen.
 * Driven entirely by the backend refund-target policy:
 *   - ORIGINAL renders a no-input original payment method option.
 *   - UPI renders a UPI VPA input.
 *   - BANK renders account number, IFSC, and holder-name inputs.
 *
 * Reports a validated `RefundTargetInput` upward (or null while invalid). The
 * server re-validates and may return COD_METHOD_MISMATCH, handled by the parent.
 */

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type {
  CodRefundMethod,
  RefundTargetInput,
  RefundTargetType,
} from '@/lib/returns-types';

const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_RE = /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9._-]{2,64}$/;
const BANK_ACCOUNT_RE = /^\d{6,18}$/;
type RefundTargetMode = Extract<RefundTargetType, 'ORIGINAL' | 'UPI' | 'BANK'>;

interface RefundTargetSelectorProps {
  allowedTypes: RefundTargetType[];
  codRefundMethod: CodRefundMethod;
  savedMasked?: string | null;
  savedIsStale?: boolean;
  onChange: (target: RefundTargetInput | null) => void;
}

function pickInitialMode(
  allowedTypes: RefundTargetType[],
  codRefundMethod: CodRefundMethod
): RefundTargetMode {
  return getAllowedModes(allowedTypes, codRefundMethod)[0] ?? 'ORIGINAL';
}

function getAllowedModes(
  allowedTypes: RefundTargetType[],
  codRefundMethod: CodRefundMethod
): RefundTargetMode[] {
  const manualModes =
    codRefundMethod === 'MANUAL_UPI'
      ? (['UPI'] as const)
      : codRefundMethod === 'MANUAL_BANK'
        ? (['BANK'] as const)
        : (['UPI', 'BANK'] as const);

  const modes = manualModes.filter((type) => allowedTypes.includes(type));
  if (modes.length > 0) return [...modes];
  if (allowedTypes.includes('ORIGINAL')) return ['ORIGINAL'];
  return [];
}

const RefundTargetSelector: React.FC<RefundTargetSelectorProps> = ({
  allowedTypes,
  codRefundMethod,
  savedMasked,
  savedIsStale,
  onChange,
}) => {
  const modes = useMemo(
    () => getAllowedModes(allowedTypes, codRefundMethod),
    [allowedTypes, codRefundMethod]
  );
  const [mode, setMode] = useState<RefundTargetMode>(
    pickInitialMode(allowedTypes, codRefundMethod)
  );

  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [holderName, setHolderName] = useState('');

  useEffect(() => {
    if (!modes.includes(mode)) {
      setMode(pickInitialMode(allowedTypes, codRefundMethod));
    }
  }, [allowedTypes, codRefundMethod, mode, modes]);

  const computed = useMemo<RefundTargetInput | null>(() => {
    if (!modes.includes(mode)) return null;
    if (mode === 'ORIGINAL') return { type: 'ORIGINAL' };
    if (mode === 'UPI') {
      const clean = upiId.trim();
      if (!UPI_RE.test(clean)) return null;
      return {
        type: 'UPI',
        upiId: clean,
        holderName: holderName.trim() || undefined,
      };
    }
    const acct = bankAccount.trim();
    const code = ifsc.trim().toUpperCase();
    const name = holderName.trim();
    if (!BANK_ACCOUNT_RE.test(acct) || !IFSC_RE.test(code) || name.length < 2)
      return null;
    return { type: 'BANK', bankAccount: acct, ifsc: code, holderName: name };
  }, [modes, mode, upiId, bankAccount, ifsc, holderName]);

  useEffect(() => {
    onChange(computed);
  }, [computed, onChange]);

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      {savedMasked && (
        <p className="text-xs text-muted-foreground">
          Saved: {savedMasked}
          {savedIsStale && (
            <span className="ml-1 text-amber-600">· please re-verify</span>
          )}
        </p>
      )}

      {modes.length > 1 && (
        <div className="inline-flex rounded-full border border-border p-0.5 text-sm">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'rounded-full px-4 py-1 font-medium transition',
                mode === m
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground'
              )}
            >
              {m === 'ORIGINAL' ? 'Original' : m === 'UPI' ? 'UPI' : 'Bank'}
            </button>
          ))}
        </div>
      )}

      {mode === 'ORIGINAL' ? (
        <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          Refund to original payment method.
        </div>
      ) : mode === 'UPI' ? (
        <div className="space-y-2">
          <Field
            label="UPI ID"
            placeholder="name@bank"
            value={upiId}
            onChange={setUpiId}
          />
          <Field
            label="Account holder name (optional)"
            placeholder="As per bank records"
            value={holderName}
            onChange={setHolderName}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Field
            label="Account number"
            value={bankAccount}
            onChange={setBankAccount}
          />
          <Field
            label="IFSC"
            placeholder="ABCD0123456"
            value={ifsc}
            onChange={(v) => setIfsc(v.toUpperCase())}
          />
          <Field
            label="Account holder name"
            value={holderName}
            onChange={setHolderName}
          />
        </div>
      )}
    </div>
  );
};

const Field: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, placeholder, value, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-medium text-muted-foreground">
      {label}
    </span>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
    />
  </label>
);

export default RefundTargetSelector;
