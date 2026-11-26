import { supportEmail } from '@/config/site';

export const STORE_NOT_READY_MESSAGE =
  "This store isn't ready to take orders yet. Please try again later.";
export const ITEM_NOT_SELLABLE_MESSAGE =
  "One of the items in your cart can't be ordered right now. Please remove it or try again later.";
export const SHIP_TO_PINCODE_UNAVAILABLE_MESSAGE =
  "Sorry, this store can't deliver to this pincode right now. Please try a different pincode.";
export const B2B_STATE_MISMATCH_MESSAGE =
  'A business invoice is available only when the delivery State matches the invoice details. Continue without a business invoice?';
export const B2B_NOT_AVAILABLE_MESSAGE =
  "A business invoice isn't available for this store.";
export const INVALID_BUSINESS_INVOICE_NUMBER_MESSAGE =
  'The business invoice number is invalid. Please check the 15-character number and try again.';
export const B2B_DETAILS_MISSING_MESSAGE =
  'Please complete the required business invoice details.';
export const CONTINUE_WITHOUT_BUSINESS_INVOICE_MESSAGE =
  'Continue without a business invoice';
export const COMPLETE_BUSINESS_INVOICE_DETAILS_MESSAGE =
  'Complete the business invoice details to continue, or untick the option.';
export const INVALID_BUSINESS_INVOICE_FORM_MESSAGE =
  'The business invoice number is invalid. Please check and try again.';
export const BUSINESS_NAME_REQUIRED_MESSAGE =
  'Business name is required for the invoice.';
export const BUSINESS_BILLING_ADDRESS_REQUIRED_MESSAGE =
  'Complete the billing address for the business invoice.';

type CheckoutErrorDetails = Record<string, unknown> | string | null | undefined;

function stateNameFrom(details: CheckoutErrorDetails): string | null {
  if (
    details &&
    typeof details === 'object' &&
    typeof details.stateName === 'string' &&
    details.stateName.trim()
  ) {
    return details.stateName.trim();
  }
  return null;
}

export function getShipToStateNotAllowedMessage(
  details?: CheckoutErrorDetails
): string {
  const stateName = stateNameFrom(details);
  return stateName
    ? `Sorry, this store currently delivers only within ${stateName}. Please try a pincode in ${stateName}.`
    : SHIP_TO_PINCODE_UNAVAILABLE_MESSAGE;
}

export function getDeliverySupportMessage(): string {
  return `Need help? Contact the store at ${supportEmail}.`;
}

export function getBuyerFriendlyCheckoutMessage(
  code: string | null | undefined,
  backendMessage?: string | null,
  details?: CheckoutErrorDetails,
  fallback = 'We could not process this order.'
): string {
  switch (code) {
    case 'SHIP_TO_STATE_NOT_ALLOWED':
      return getShipToStateNotAllowedMessage(details);
    case 'PINCODE_NOT_SERVICEABLE':
      return SHIP_TO_PINCODE_UNAVAILABLE_MESSAGE;
    case 'SHIPPING_PARCEL_UNAVAILABLE':
      return "We couldn't calculate shipping for this cart. Please contact the store.";
    case 'SHIPPING_RATE_UNAVAILABLE':
    case 'DELIVERY_CHECK_FAILED':
      return "We couldn't calculate shipping right now. Please try again in a moment.";
    case 'COD_NOT_AVAILABLE':
      return 'Cash on Delivery is not available for this pincode.';
    case 'TAX_IDENTITY_MISSING':
    case 'TAX_NOT_READY':
    case 'TAX_INCLUSIVE_REQUIRED':
      return STORE_NOT_READY_MESSAGE;
    case 'TAX_NOT_SELLABLE':
      return ITEM_NOT_SELLABLE_MESSAGE;
    case 'B2B_STATE_MISMATCH':
      return B2B_STATE_MISMATCH_MESSAGE;
    case 'B2B_NOT_AVAILABLE':
      return B2B_NOT_AVAILABLE_MESSAGE;
    case 'INVALID_GSTIN':
      return INVALID_BUSINESS_INVOICE_NUMBER_MESSAGE;
    case 'B2B_DETAILS_MISSING':
      return B2B_DETAILS_MISSING_MESSAGE;
    default:
      return backendMessage || fallback;
  }
}
