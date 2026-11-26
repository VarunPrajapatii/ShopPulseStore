import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { DeliveryAvailabilityErrorCode } from '@/actions/get-delivery-charges';

export interface ShippingData {
  pincode: string;
  serviceable: boolean;
  pickupPincode: string | null;
  totalCouriersAvailable: number;
  estimatedDays: { min: number; max: number } | null;
  codAvailable: boolean;
  codEnabledForStore: boolean;
  codCouriersCount: number;
  codChargeAmount: number | null;
  allowB2BInvoices: boolean;
  shipToAllowed: boolean | null;
  stateCodes: string[];
  stateNames: string[];
  errorMessage?: string;
  errorCode?: DeliveryAvailabilityErrorCode;
  retryable?: boolean;
}

interface ShippingStore {
  shippingData: ShippingData | null;
  isLoading: boolean;
  setShippingData: (data: ShippingData) => void;
  setLoading: (loading: boolean) => void;
  clearShippingData: () => void;
  getPincode: () => string | null;
}

const useShipping = create(
  persist<ShippingStore>(
    (set, get) => ({
      shippingData: null,
      isLoading: false,

      setShippingData: (data: ShippingData) => {
        set({ shippingData: data });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearShippingData: () => {
        set({ shippingData: null });
      },

      getPincode: () => {
        return get().shippingData?.pincode || null;
      },
    }),
    {
      name: 'shipping-storage-v2',
      version: 2,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useShipping;
