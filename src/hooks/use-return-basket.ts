'use client';

/**
 * use-return-basket — the multi-slice return basket, persisted to sessionStorage
 * and keyed by orderId so two different orders never share a draft.
 *
 * Each "slice" is one per-item return request (Amazon/Myntra style: every order
 * item the customer selects becomes its own configurable slice). The basket
 * carries a single stable `submissionId` (UUID v4) generated once and reused on
 * every retry so the idempotent POST /returns dedupes correctly.
 *
 * The backend is law: this store holds the customer's INTENT only. It never
 * computes money, eligibility, or settlement — those come back from the submit
 * response and are rendered on the review screen.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { RefundTargetInput, Resolution } from '@/lib/returns-types';

/** A single per-item draft return request. */
export interface BasketSlice {
  /** Stable client id for list keys / editing (not sent to server). */
  draftId: string;
  orderItemId: string;
  /** Display snapshot captured when the slice was added. */
  snapshot: {
    productName: string;
    variantLabel: string | null;
    imageUrl: string | null;
    unitPriceInr: string;
  };
  quantity: number;
  resolution: Resolution;
  reasonConfigId: string | null;
  reasonDetailedId: string | null;
  reasonText: string | null;
  /** Cloudinary secure_urls already uploaded for this slice. */
  photos: string[];
  /** EXCHANGE only — chosen replacement target. */
  exchangeChoice: {
    newProductId: string;
    newVariantId: string;
    quotedDiffInr?: number;
  } | null;
  /** True once the per-item config page considers this slice complete. */
  configured: boolean;
}

interface BasketData {
  /** Stable idempotency key for this basket's submit. */
  submissionId: string;
  slices: BasketSlice[];
  refundTarget: RefundTargetInput | null;
  policyAccepted: boolean;
}

interface ReturnBasketState {
  /** All in-progress baskets, keyed by orderId. */
  baskets: Record<string, BasketData>;

  getBasket: (orderId: string) => BasketData | null;
  getSlice: (orderId: string, draftId: string) => BasketSlice | null;
  getSliceCount: (orderId: string) => number;

  /** Add a slice for an order item (or return the existing one for it). */
  addSlice: (
    orderId: string,
    item: Pick<BasketSlice, 'orderItemId' | 'snapshot'> & {
      resolution?: Resolution;
    }
  ) => string;
  updateSlice: (
    orderId: string,
    draftId: string,
    patch: Partial<BasketSlice>
  ) => void;
  removeSlice: (orderId: string, draftId: string) => void;

  setRefundTarget: (orderId: string, target: RefundTargetInput | null) => void;
  setPolicyAccepted: (orderId: string, accepted: boolean) => void;

  /** Clear a basket after a successful submit (or explicit discard). */
  clearBasket: (orderId: string) => void;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (non-secure contexts only): RFC4122-ish v4.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function emptyBasket(): BasketData {
  return {
    submissionId: newId(),
    slices: [],
    refundTarget: null,
    policyAccepted: false,
  };
}

const useReturnBasket = create(
  persist<ReturnBasketState>(
    (set, get) => ({
      baskets: {},

      getBasket: (orderId) => get().baskets[orderId] ?? null,

      getSlice: (orderId, draftId) =>
        get().baskets[orderId]?.slices.find((s) => s.draftId === draftId) ??
        null,

      getSliceCount: (orderId) => get().baskets[orderId]?.slices.length ?? 0,

      addSlice: (orderId, item) => {
        const state = get();
        const basket = state.baskets[orderId] ?? emptyBasket();

        const existing = basket.slices.find(
          (s) => s.orderItemId === item.orderItemId
        );
        if (existing) return existing.draftId;

        const draftId = newId();
        const slice: BasketSlice = {
          draftId,
          orderItemId: item.orderItemId,
          snapshot: item.snapshot,
          quantity: 1,
          resolution: item.resolution ?? 'REFUND',
          reasonConfigId: null,
          reasonDetailedId: null,
          reasonText: null,
          photos: [],
          exchangeChoice: null,
          configured: false,
        };

        set({
          baskets: {
            ...state.baskets,
            [orderId]: { ...basket, slices: [...basket.slices, slice] },
          },
        });
        return draftId;
      },

      updateSlice: (orderId, draftId, patch) => {
        const state = get();
        const basket = state.baskets[orderId];
        if (!basket) return;
        set({
          baskets: {
            ...state.baskets,
            [orderId]: {
              ...basket,
              slices: basket.slices.map((s) =>
                s.draftId === draftId ? { ...s, ...patch } : s
              ),
            },
          },
        });
      },

      removeSlice: (orderId, draftId) => {
        const state = get();
        const basket = state.baskets[orderId];
        if (!basket) return;
        const slices = basket.slices.filter((s) => s.draftId !== draftId);
        const nextBaskets = { ...state.baskets };
        if (slices.length === 0) {
          delete nextBaskets[orderId];
        } else {
          nextBaskets[orderId] = { ...basket, slices };
        }
        set({ baskets: nextBaskets });
      },

      setRefundTarget: (orderId, target) => {
        const state = get();
        const basket = state.baskets[orderId] ?? emptyBasket();
        set({
          baskets: {
            ...state.baskets,
            [orderId]: { ...basket, refundTarget: target },
          },
        });
      },

      setPolicyAccepted: (orderId, accepted) => {
        const state = get();
        const basket = state.baskets[orderId] ?? emptyBasket();
        set({
          baskets: {
            ...state.baskets,
            [orderId]: { ...basket, policyAccepted: accepted },
          },
        });
      },

      clearBasket: (orderId) => {
        const state = get();
        if (!state.baskets[orderId]) return;
        const nextBaskets = { ...state.baskets };
        delete nextBaskets[orderId];
        set({ baskets: nextBaskets });
      },
    }),
    {
      name: 'return-basket-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useReturnBasket;
