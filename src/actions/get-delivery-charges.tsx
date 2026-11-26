import { getBuyerFriendlyCheckoutMessage } from '@/lib/checkout-messages';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type DeliveryAvailabilityErrorCode =
  | 'INVALID_PINCODE'
  | 'PINCODE_NOT_SERVICEABLE'
  | 'SHIP_TO_STATE_NOT_ALLOWED'
  | 'PINCODE_NOT_IN_DIRECTORY'
  | 'STORE_CONFIGURATION_ERROR'
  | 'PROVIDER_AUTHENTICATION_ERROR'
  | 'PROVIDER_UNAVAILABLE'
  | 'UNKNOWN';

// Response interface matching backend's /shipping/delivery-charges endpoint
export interface DeliveryChargesResponse {
  serviceable: boolean;
  deliveryPincode: string;
  pickupPincode: string | null;
  totalCouriersAvailable: number;
  estimatedDeliveryDays: {
    min: number;
    max: number;
  } | null;
  codAvailable: boolean;
  codEnabledForStore: boolean;
  codCouriersCount: number;
  codChargeAmount: number | null;
  allowB2BInvoices: boolean;
  shipToAllowed: boolean | null;
  stateCodes: string[];
  stateNames: string[];
  error?: string;
  errorCode?: DeliveryAvailabilityErrorCode;
  retryable?: boolean;
  details?: Record<string, unknown>;
}

export interface DeliveryChargesError {
  serviceable: false;
  error: string;
  errorCode: DeliveryAvailabilityErrorCode;
  retryable: boolean;
  details?: Record<string, unknown>;
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
      const errorCode: DeliveryAvailabilityErrorCode =
        errorData.errorCode ||
        errorData.code ||
        (res.status >= 500 ? 'PROVIDER_UNAVAILABLE' : 'UNKNOWN');
      const details =
        errorData.details &&
        typeof errorData.details === 'object' &&
        !Array.isArray(errorData.details)
          ? (errorData.details as Record<string, unknown>)
          : undefined;
      return {
        serviceable: false,
        error: getBuyerFriendlyCheckoutMessage(
          errorCode,
          errorData.error ||
            errorData.message ||
            `Failed to check delivery: ${res.status}`,
          details
        ),
        errorCode,
        retryable: errorData.retryable ?? res.status >= 500,
        details,
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
