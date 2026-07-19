import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ShippingChargeMode = 'FIXED' | 'VARIABLE';
export type ShippingChargeSource = 'DISABLED' | 'FIXED' | 'VARIABLE';

export interface ShippingData {
  pincode: string;
  serviceable: boolean;
  deliveryCharge: number | null;
  estimatedDays: { min: number; max: number } | null;
  codAvailable: boolean;
  codEnabledForStore: boolean;
  codChargeAmount: number | null;
  allowB2BInvoices: boolean;
  shippingChargeEnabled: boolean;
  shippingChargeMode: ShippingChargeMode;
  variableShippingChargeAllowed: boolean;
  fixedShippingCharge: number | null;
  shippingChargeSource: ShippingChargeSource | null;
  errorMessage?: string;
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
      name: 'shipping-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useShipping;
