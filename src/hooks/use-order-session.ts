'use client';

/**
 * use-order-session - in-memory (non-persisted) session state for the returns
 * flow on a single tracking-hub page load.
 *
 * Holds the active order context, the capabilities the current session cookie
 * grants (mirrors `meta.cookieCapabilities` from the hub), and transient UI
 * state for the OTP step-up modal. Intentionally NOT persisted: capabilities
 * live in the HttpOnly cookie (server-owned); this is just a client mirror so
 * the UI can decide whether to gate an action behind OTP.
 */

import { create } from 'zustand';
import type { Capability } from '@/lib/returns-types';

/** An action the user attempted that may require a capability step-up first. */
export type PendingAction =
  | { type: 'CANCEL_ORDER' }
  | { type: 'CANCEL_RETURN'; returnNumber: string }
  | { type: 'START_RETURN' }
  | {
      type: 'DOWNLOAD_INVOICE';
      invoiceKind: 'ORDER' | 'RETURN';
      returnNumber?: string;
    }
  | { type: 'PAY_DIFFERENCE'; returnNumber: string };

interface OrderSessionState {
  orderId: string | null;
  /** Capabilities granted by the current session cookie (server mirror). */
  cookieCapabilities: Capability[];
  /** ISO timestamp returned by auth endpoints for the active session cookie. */
  sessionExpiresAt: string | null;
  /** True once a magic-link token has been adopted this session. */
  fromMagicLink: boolean;

  /** OTP step-up modal. */
  isOtpModalOpen: boolean;
  /** The action to resume after a successful step-up. */
  pendingAction: PendingAction | null;
  /** Which capability the pending action needs. */
  requiredCapability: Capability | null;

  setOrderId: (orderId: string) => void;
  setCookieCapabilities: (
    capabilities: Capability[],
    expiresAt?: string | null
  ) => void;
  setFromMagicLink: (value: boolean) => void;

  hasCapability: (capability: Capability) => boolean;
  getRemainingSessionMs: () => number | null;
  isSessionExpired: () => boolean;

  /** Open the step-up modal for an action that needs `capability`. */
  requestStepUp: (action: PendingAction, capability: Capability) => void;
  closeOtpModal: () => void;
  clearPendingAction: () => void;

  reset: () => void;
}

const useOrderSession = create<OrderSessionState>((set, get) => ({
  orderId: null,
  cookieCapabilities: [],
  sessionExpiresAt: null,
  fromMagicLink: false,

  isOtpModalOpen: false,
  pendingAction: null,
  requiredCapability: null,

  setOrderId: (orderId) => set({ orderId }),
  setCookieCapabilities: (capabilities, expiresAt) =>
    set((state) => ({
      cookieCapabilities: capabilities,
      sessionExpiresAt:
        expiresAt !== undefined ? expiresAt : state.sessionExpiresAt,
    })),
  setFromMagicLink: (value) => set({ fromMagicLink: value }),

  hasCapability: (capability) => {
    if (get().isSessionExpired()) {
      set({ cookieCapabilities: [], sessionExpiresAt: null });
      return false;
    }
    return get().cookieCapabilities.includes(capability);
  },

  getRemainingSessionMs: () => {
    const expiresAt = get().sessionExpiresAt;
    if (!expiresAt) return null;
    const expiresMs = new Date(expiresAt).getTime();
    if (Number.isNaN(expiresMs)) return null;
    return expiresMs - Date.now();
  },

  isSessionExpired: () => {
    const remainingMs = get().getRemainingSessionMs();
    return remainingMs !== null && remainingMs <= 0;
  },

  requestStepUp: (action, capability) =>
    set({
      isOtpModalOpen: true,
      pendingAction: action,
      requiredCapability: capability,
    }),

  closeOtpModal: () => set({ isOtpModalOpen: false }),

  clearPendingAction: () =>
    set({ pendingAction: null, requiredCapability: null }),

  reset: () =>
    set({
      orderId: null,
      cookieCapabilities: [],
      sessionExpiresAt: null,
      fromMagicLink: false,
      isOtpModalOpen: false,
      pendingAction: null,
      requiredCapability: null,
    }),
}));

export default useOrderSession;
