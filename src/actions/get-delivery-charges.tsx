const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ShippingChargeMode = 'FIXED' | 'VARIABLE';
export type ShippingChargeSource = 'DISABLED' | 'FIXED' | 'VARIABLE';
export type DeliveryAvailabilityErrorCode =
  | 'INVALID_PINCODE'
  | 'PINCODE_NOT_SERVICEABLE'
  | 'STORE_CONFIGURATION_ERROR'
  | 'PROVIDER_AUTHENTICATION_ERROR'
  | 'PROVIDER_UNAVAILABLE'
  | 'UNKNOWN';

// Response interface matching backend's /shipping/delivery-charges endpoint
export interface DeliveryChargesResponse {
  // Core serviceability
  serviceable: boolean;
  deliveryPincode: string;
  pickupPincode: string | null;

  // Shipping cost (use deliveryCharge for display!)
  deliveryCharge: number | null; // Tiered charge: ₹50, ₹75, ₹100, etc.
  averageRate: number | null; // Raw average (for reference only)
  couriersConsidered: number;
  totalCouriersAvailable: number;
  shippingChargeEnabled: boolean;
  shippingChargeMode: ShippingChargeMode;
  variableShippingChargeAllowed: boolean;
  fixedShippingCharge: number | null;
  shippingChargeSource: ShippingChargeSource | null;

  // Delivery timeline
  estimatedDeliveryDays: {
    min: number;
    max: number;
  } | null;

  // COD information
  codAvailable: boolean; // Can customer pay COD for this pincode?
  codEnabledForStore: boolean; // Is COD enabled at store level?
  codCouriersCount: number; // Number of COD-supporting couriers
  codChargeAmount: number | null; // Extra COD handling charge (e.g., ₹30)
  allowB2BInvoices: boolean;

  // Errors (only present on error responses)
  error?: string;
  errorCode?: DeliveryAvailabilityErrorCode;
  retryable?: boolean;
}

export interface DeliveryChargesError {
  serviceable: false;
  error: string;
  errorCode: DeliveryAvailabilityErrorCode;
  retryable: boolean;
}

const getDeliveryCharges = async (
  deliveryPincode: string
): Promise<DeliveryChargesResponse | DeliveryChargesError> => {
  try {
    if (!deliveryPincode || deliveryPincode.length !== 6) {
      return {
        serviceable: false,
        error: 'Invalid pincode. Please enter a 6-digit pincode.',
        errorCode: 'INVALID_PINCODE',
        retryable: false,
      };
    }

    const res = await fetch(
      `${API_URL}/shipping/delivery-charges?pincode=${deliveryPincode}`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        serviceable: false,
        error: errorData.error || `Failed to check delivery: ${res.status}`,
        errorCode:
          errorData.errorCode ||
          (res.status >= 500 ? 'PROVIDER_UNAVAILABLE' : 'UNKNOWN'),
        retryable: errorData.retryable ?? res.status >= 500,
      };
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching delivery charges:', error);
    return {
      serviceable: false,
      error: 'Unable to check delivery availability. Please try again.',
      errorCode: 'PROVIDER_UNAVAILABLE',
      retryable: true,
    };
  }
};

export default getDeliveryCharges;
