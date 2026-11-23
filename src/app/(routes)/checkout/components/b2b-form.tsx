'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { normalizeGstin, validateGstin } from '@/lib/gstin';
import { indianStates } from '@/lib/utils';
import type { BuyerBlock } from '@/lib/returns-api';
import {
  BUSINESS_BILLING_ADDRESS_REQUIRED_MESSAGE,
  BUSINESS_NAME_REQUIRED_MESSAGE,
  INVALID_BUSINESS_INVOICE_FORM_MESSAGE,
} from '@/lib/checkout-messages';

interface B2bFormProps {
  disabled?: boolean;
  shipToState: string | null;
  onChange: (buyer: BuyerBlock | null) => void;
  /** Hard error from server — highlight the matching field */
  serverError?:
    | 'INVALID_GSTIN'
    | 'MISSING_LEGAL_NAME'
    | 'MISSING_B2B_ADDRESS'
    | null;
}

export default function B2bForm({
  disabled,
  shipToState,
  onChange,
  serverError,
}: B2bFormProps) {
  const [gstin, setGstin] = useState('');
  const [legalName, setLegalName] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const gstinValid = validateGstin(gstin);

  /** Notify parent of current values every time a field changes */
  function notify(
    updates: Partial<{
      gstin: string;
      legalName: string;
      line1: string;
      line2: string;
      city: string;
      state: string;
      pincode: string;
    }>
  ) {
    const g = updates.gstin ?? gstin;
    const ln = updates.legalName ?? legalName;
    const l1 = updates.line1 ?? line1;
    const ct = updates.city ?? city;
    const st = updates.state ?? state;
    const pc = updates.pincode ?? pincode;

    const normalizedGstin = normalizeGstin(g);
    const isComplete =
      validateGstin(normalizedGstin) &&
      ln.trim().length >= 2 &&
      l1.trim().length > 0 &&
      ct.trim().length > 0 &&
      st.trim().length > 0 &&
      /^[0-9]{6}$/.test(pc);

    if (!isComplete) {
      onChange(null);
      return;
    }

    const buyer: BuyerBlock = {
      gstin: normalizedGstin,
      legalName: ln.trim(),
      billingAddress: {
        line1: l1.trim(),
        line2: (updates.line2 ?? line2).trim() || undefined,
        city: ct.trim(),
        state: st,
        pincode: pc,
      },
    };
    onChange(buyer);
  }

  const baseInputCls =
    'w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50';
  const inputCls = (highlight: boolean) =>
    `${baseInputCls} ${highlight ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}`;

  return (
    <div className="space-y-4">
      {/* GSTIN */}
      <div>
        <div className="mb-1 flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-gray-700">
            GSTIN <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-gray-500">
            Ship-to state: {shipToState || 'Not selected'}
          </span>
        </div>
        <div className="relative">
          <input
            disabled={disabled}
            value={gstin}
            maxLength={15}
            placeholder="e.g. 27AAPFU0939F1ZV"
            className={`${inputCls(serverError === 'INVALID_GSTIN')} pr-8 font-mono uppercase`}
            onChange={(e) => {
              const v = normalizeGstin(e.target.value);
              setGstin(v);
              notify({ gstin: v });
            }}
          />
          {gstinValid && (
            <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {serverError === 'INVALID_GSTIN' && (
          <p className="text-xs text-red-500 mt-1">
            {INVALID_BUSINESS_INVOICE_FORM_MESSAGE}
          </p>
        )}
        {gstin.length === 15 && !gstinValid && (
          <p className="text-xs text-red-500 mt-1">
            {INVALID_BUSINESS_INVOICE_FORM_MESSAGE}
          </p>
        )}
      </div>

      {/* Legal Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Legal / Trade Name <span className="text-red-500">*</span>
        </label>
        <input
          disabled={disabled}
          value={legalName}
          placeholder="Registered business name"
          className={inputCls(serverError === 'MISSING_LEGAL_NAME')}
          onChange={(e) => {
            setLegalName(e.target.value);
            notify({ legalName: e.target.value });
          }}
        />
        {serverError === 'MISSING_LEGAL_NAME' && (
          <p className="text-xs text-red-500 mt-1">
            {BUSINESS_NAME_REQUIRED_MESSAGE}
          </p>
        )}
      </div>

      {/* Billing Address */}
      <fieldset
        className={`space-y-3 border rounded-lg p-4 ${serverError === 'MISSING_B2B_ADDRESS' ? 'border-red-400' : 'border-gray-200'}`}
      >
        <legend className="text-sm font-medium text-gray-700 px-1">
          GST Billing Address <span className="text-red-500">*</span>
        </legend>

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Address Line 1 *
          </label>
          <input
            disabled={disabled}
            value={line1}
            placeholder="Flat, House no., Building"
            className={inputCls(false)}
            onChange={(e) => {
              setLine1(e.target.value);
              notify({ line1: e.target.value });
            }}
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Address Line 2
          </label>
          <input
            disabled={disabled}
            value={line2}
            placeholder="Area, Street (optional)"
            className={inputCls(false)}
            onChange={(e) => {
              setLine2(e.target.value);
              notify({ line2: e.target.value });
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">City *</label>
            <input
              disabled={disabled}
              value={city}
              placeholder="City"
              className={inputCls(false)}
              onChange={(e) => {
                setCity(e.target.value);
                notify({ city: e.target.value });
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Pincode *
            </label>
            <input
              disabled={disabled}
              value={pincode}
              placeholder="6-digit pincode"
              maxLength={6}
              className={inputCls(false)}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                setPincode(v);
                notify({ pincode: v });
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">State *</label>
          <select
            disabled={disabled}
            value={state}
            className={`${inputCls(false)} bg-white`}
            onChange={(e) => {
              setState(e.target.value);
              notify({ state: e.target.value });
            }}
          >
            <option value="">Select state</option>
            {indianStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {serverError === 'MISSING_B2B_ADDRESS' && (
          <p className="text-xs text-red-500">
            {BUSINESS_BILLING_ADDRESS_REQUIRED_MESSAGE}
          </p>
        )}
      </fieldset>
    </div>
  );
}
