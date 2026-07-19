/**
 * Returns / Exchange / Replacement API contract types.
 *
 * The backend is the single source of truth: every money field arrives as a
 * decimal STRING (e.g. "1499.00"). Never parseFloat for display. Render
 * server numbers verbatim via the Currency component.
 *
 * NOTE: all `*Inr` fields are decimal strings, all timestamps are ISO 8601 strings.
 */

/* ------------------------------------------------------------------ */
/* Shared enums / unions                                               */
/* ------------------------------------------------------------------ */

export type Resolution = 'REFUND' | 'EXCHANGE' | 'REPLACEMENT';

export type Capability = 'INVOICE' | 'RETURN';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'CANCELLATION_PENDING'
  | 'REFUNDED'
  | (string & {}); // tolerate unknown future statuses

export type ReturnStatus =
  | 'PENDING_PAYMENT'
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'REFUND_INITIATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | (string & {});

export type TimelineKind =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PICKUP_SCHEDULED'
  | 'PICKED_UP'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'REFUND_INITIATED'
  | 'COMPLETED'
  | 'CANCELLED'
  | (string & {});

export type VariantFilterHint =
  | 'LARGER_SIZES'
  | 'SMALLER_SIZES'
  | 'SAME_VARIANT_DIFFERENT_UNIT'
  | 'ANY_DIFFERENT_VARIANT'
  | 'NO_VARIANT_PREFERENCE'
  | null;

export type AppliedFilter =
  | 'LARGER_SIZES'
  | 'SMALLER_SIZES'
  | 'SAME_VARIANT_DIFFERENT_UNIT'
  | 'ANY_DIFFERENT_VARIANT'
  | 'NO_VARIANT_PREFERENCE'
  | 'DEGRADED_TO_ANY'
  | 'ALL_SIZES'
  | 'REPLACEMENT'
  | 'NON_VARIANT_PRODUCT'
  | (string & {});

export type RefundTargetType = 'ORIGINAL' | 'UPI' | 'BANK';

export type CodRefundMethod = 'MANUAL_UPI' | 'MANUAL_BANK' | 'CHOICE';

/** Standard error envelope returned on any non-2xx. */
export interface ApiError {
  ok: false;
  error: string;
  attemptsLeft?: number;
  details?: unknown;
}

/* ------------------------------------------------------------------ */
/* GET /order/{orderId}/tracking-hub                                  */
/* ------------------------------------------------------------------ */

export interface HubAddress {
  name: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
}

export interface HubOrder {
  id: string;
  orderNumber: string | null; // null means render a short order id
  orderStatus: OrderStatus;
  paymentMethod: string | null;
  placedAt: string;
  shippedAt: string | null; // null means derive the current step from status
  deliveredAt: string | null;
  subtotalInr: string;
  shippingInr: string;
  couponInr: string; // v1: "0.00" → hide line when zero
  paidInr: string;
  isPaid: boolean;
  cancelledAt: string | null;
  cancellationRequestedAt: string | null;
  canCancel: boolean; // render Cancel CTA off THIS, never re-derive
  shippingAddress: HubAddress;
  /**
   * Set once the invoice PDF has been issued (PREPAID: on payment.captured;
   * COD: on delivery). Storefront uses this as the visibility trigger for the
   * invoice download / email-resend CTAs. Null means not yet issued.
   */
  invoiceNumber: string | null;
}

export interface WindowInfo {
  endsAt: string;
  daysLeft: number;
}

export interface HubItemWindows {
  return: WindowInfo | null;
  exchange: WindowInfo | null;
  replacement: WindowInfo | null;
}

export interface HubItem {
  orderItemId: string;
  productId: string | null;
  snapshot: {
    productName: string;
    variantLabel: string | null;
    imageUrl: string | null;
    unitPriceInr: string;
  };
  qtyOrdered: number;
  qtyAvailable: number; // not-yet-returned
  canStartReturn: boolean; // drives "Start a return" CTA
  windowsRemaining: HubItemWindows;
  blockedReasons: string[];
}

export interface PickupBundle {
  bundleNumber: string;
  courier: string | null;
  awb: string | null;
  scheduledFor: string | null;
  pickedUpAt: string | null;
  expectedDelivery: string | null; // may be null
}

export interface TimelineEntry {
  kind: TimelineKind;
  at: string;
}

export interface PendingPayment {
  amountInr: string;
  razorpayOrderId: string | null;
  ageMinutes: number;
}

export interface HubReturn {
  returnNumber: string;
  status: ReturnStatus;
  resolution: Resolution;
  orderItemId: string;
  productSnapshot: {
    name: string;
    variantLabel: string | null;
    imageUrl: string | null;
  };
  quantity: number;
  submittedAt: string;
  expectedRefundInr: string | null; // GROSS estimate → label "Estimated"
  expectedRefundTargetMasked: string | null;
  pickupBundle: PickupBundle | null;
  timeline: TimelineEntry[];
  canCancel: boolean; // render Cancel-return off THIS
  pendingPayment: PendingPayment | null;
}

export interface HubInvoice {
  kind: 'ORDER' | 'RETURN';
  returnNumber?: string;
  url: string | null; // v1: null → hide CTA
  label: string;
}

export interface HubMeta {
  cookieCapabilities: Capability[]; // empty when no/invalid cookie
  supportEmail: string | null;
  grievanceOfficer: {
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null; // null means hide footer
  codRefundMethod: CodRefundMethod;
}

export interface TrackingHubResponse {
  ok: true;
  order: HubOrder;
  items: HubItem[];
  returns: HubReturn[];
  chain: { ancestors: unknown[]; descendants: unknown[] }; // v1: always empty
  invoices: HubInvoice[];
  meta: HubMeta;
}

/* ------------------------------------------------------------------ */
/* Auth / session                                                     */
/* ------------------------------------------------------------------ */

export interface AdoptLinkTokenResponse {
  ok: true;
  capabilities: Capability[];
  expiresAt: string;
}

export interface RequestOtpResponse {
  ok: true;
  channel: 'phone' | 'email';
  masked: string;
  cooldownSec: number;
}

export interface VerifyOtpResponse {
  ok: true;
  token: string;
  expiresAt: string;
  capabilities: Capability[];
}

export interface LogoutResponse {
  ok: true;
}

/* ------------------------------------------------------------------ */
/* GET /returns/eligibility                                           */
/* ------------------------------------------------------------------ */

export interface ActionAllowance {
  allowed: boolean;
  windowEndsAt?: string; // present on allowed=true AND on WINDOW_CLOSED block
  reason?: string;
  maxChainDepth?: number;
}

export interface EligibilityItem {
  orderItemId: string;
  snapshot: {
    productName: string;
    variantLabel: string | null;
    imageUrl: string | null;
    unitPrice: string;
    currency: 'INR';
  };
  qtyOrdered: number;
  qtyAlreadyActioned: number;
  qtyAvailable: number;
  actionsAllowed: {
    REFUND: ActionAllowance;
    EXCHANGE: ActionAllowance;
    REPLACEMENT: ActionAllowance;
  };
  reasonsAllowed: string[];
  requiresPhotoForReasons: string[];
  nonReturnable: boolean;
  nonReturnableReason: string | null;
}

export interface ReverseShippingPolicy {
  mode: string;
  flatAmountInr: string;
  inheritPct: number;
  payerOnReturn: 'STORE' | 'CUSTOMER' | 'CONDITIONAL';
  payerOnExchange: 'STORE' | 'CUSTOMER' | 'CONDITIONAL';
  payerOnReplacement: 'STORE' | 'CUSTOMER' | 'CONDITIONAL';
}

export interface WaiverPolicy {
  thresholdInr: string;
  maxSubmissionsPerOrder: number;
  maxAmountPerOrderInr: string;
  remainingSubmissions: number;
  remainingAmountInr: string;
}

export interface EligibilityPolicy {
  maxBasketSlicesPerSubmission: number;
  maxCustomerImagesPerUnit: number;
  requirePhotoForReturn: boolean;
  requirePhotoForRefund: boolean;
  requirePhotoForExchange: boolean;
  requirePhotoForReplacement: boolean;
  reverseShipping: ReverseShippingPolicy;
  waiver: WaiverPolicy;
  refundShaping: {
    restockingFeeEnabled: boolean;
    defaultRestockingFeePercent: number;
    codRefundMethod: CodRefundMethod;
    codRefundSlaHours: number;
  };
  allowResolutionConversionAfterSubmit: boolean;
  returnsPolicyText: string | null;
  returnsPolicyUrl: string | null;
}

export interface EligibilityChainEntry {
  returnNumber: string;
  status: ReturnStatus;
  orderItemId: string;
  resolution: Resolution;
  submittedAt: string;
}

export interface EligibilityResponse {
  ok: true;
  order: { id: string; deliveredAt: string | null; status: OrderStatus };
  items: EligibilityItem[];
  store: { name: string; logoUrl: string | null; exchangeFlowMode: string };
  policy: EligibilityPolicy;
  chain: EligibilityChainEntry[];
  refundContext: {
    shippingCostInr: string;
    codChargeInr: string;
    forwardShippingAlreadyRefunded: boolean;
    codChargeAlreadyRefunded: boolean;
  };
}

/* ------------------------------------------------------------------ */
/* GET /returns/reasons                                               */
/* ------------------------------------------------------------------ */

export interface DetailedReason {
  reasonDetailedId: string;
  code: string;
  label: string;
  isActive: boolean;
  variantFilterHint: VariantFilterHint;
}

export interface ReasonConfig {
  reasonConfigId: string;
  code: string;
  label: string;
  sortOrder: number;
  defaultResolution: Resolution | null;
  appliesToResolutions: Resolution[];
  availableResolutions: Resolution[]; // already limited by item eligibility
  bypassesNonReturnable: boolean;
  isSystemProtected: boolean;
  allowFallbackToRefund: boolean;
  requiresPhoto: boolean;
  requiresDetail: boolean;
  customerEducationHint: string | null;
  detailedReasons: DetailedReason[] | null;
}

export interface ReasonsResponse {
  ok: true;
  orderItemId: string;
  productId: string | null;
  nonReturnable: boolean;
  nonReturnableReason: string | null;
  reasons: ReasonConfig[];
  globalBlock?: string;
}

/* ------------------------------------------------------------------ */
/* GET /returns/exchange-options                                      */
/* ------------------------------------------------------------------ */

export interface ExchangeVariant {
  variantId: string;
  label: string;
  priceInr: string;
  stock: number;
  inStock: boolean;
  priceDiffInr: string; // signed
  imageUrl: string | null;
}

export interface ExchangeOptionsResponse {
  ok?: true;
  orderItemId: string;
  productId: string;
  originalVariant: {
    variantId: string | null;
    label: string;
    priceInr: string;
  };
  intent: 'EXCHANGE' | 'REPLACEMENT';
  appliedFilter: AppliedFilter;
  variants: ExchangeVariant[];
  suggestedFallbackResolution: 'REFUND' | null;
  fallbackEducationHint: string | null;
}

/* ------------------------------------------------------------------ */
/* POST /returns submit                                               */
/* ------------------------------------------------------------------ */

export interface SubmitSlice {
  orderItemId: string;
  quantity: number; // limited by available quantity
  resolution: Resolution;
  reasonConfigId: string;
  reasonDetailedId?: string | null;
  reasonText?: string | null; // ≤2000
  photos?: string[]; // Cloudinary secure_urls (flat)
  exchangeChoice?: {
    newProductId: string;
    newVariantId: string;
    quotedDiffInr?: number;
  };
}

export type RefundTargetInput =
  | { type: 'ORIGINAL' }
  | { type: 'UPI'; upiId: string; holderName?: string }
  | { type: 'BANK'; bankAccount: string; ifsc: string; holderName: string };

export interface SubmitBody {
  slices: SubmitSlice[];
  refundTarget?: RefundTargetInput;
  customerNotes?: string | null;
}

/* submitted[] line cards ------------------------------------------ */

export type SettlementKind = 'PAY' | 'REFUND' | 'EVEN' | 'REPLACEMENT';

export interface SubmittedSlice {
  returnNumber: string;
  returnRequestId: string;
  sliceIndex: number;
  orderItemId: string;
  resolution: Resolution;
  status: ReturnStatus;
  // display
  quantity: number;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceInr: string;
  lineValueInr: string;
  // exchange target (EXCHANGE only)
  newProductId: string | null;
  newVariantId: string | null;
  newUnitPriceInr: string | null;
  // money classification — drives card layout
  kind: SettlementKind;
  reverseShippingFeeShareInr: string;
  waivedShareInr: string;
  netReverseShippingFeeInr: string; // show row ONLY if > 0
  estimatedRefundInr: string | null;
  priceDifferenceInr?: string; // signed
  // soft fallback when the target is unavailable at submit
  softFallbackApplied?: boolean;
  originalResolution?: Resolution;
}

/* settlement totals ------------------------------------------------ */

export type SettlementOutcome = 'PAYMENT_DUE' | 'REFUND_DUE' | 'EVEN';

export interface Settlement {
  outcome: SettlementOutcome;
  currency: 'INR';
  payableInr: string;
  waivedInr: string;
  reverseShippingTotalInr: string;
  reverseShippingFeeChargedInr: string;
  reverseShippingFeeFromRefundInr: string;
  diffPayableInr: string;
  refundDueInr: string;
  estimatedRefundTotalInr: string;
  razorpayOrderId: string | null;
  keyId: string | null; // prefer over env
  prefill: { name: string; email: string; contact: string };
  refundTargetType: RefundTargetType | null;
  refundTargetMasked: string | null;
  waiverApplied: boolean;
}

export interface SubmitResponse {
  ok: true;
  submitted: SubmittedSlice[];
  settlement: Settlement;
}

/* ------------------------------------------------------------------ */
/* POST /returns/upload-photo                                        */
/* ------------------------------------------------------------------ */

export interface UploadPhotoResponse {
  ok: true;
  uploadUrl: string;
  fields: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/* Cancel, refund target, retry payment                               */
/* ------------------------------------------------------------------ */

export interface SavedRefundTarget {
  type: RefundTargetType;
  masked: string;
  setAtIso: string;
  isStale: boolean;
  staleReason?: string;
}

export interface RefundTargetResponse {
  ok: true;
  savedRefundTarget: SavedRefundTarget | null;
  refundTargetPolicy: {
    codRefundMethod: CodRefundMethod;
    allowedTypes: RefundTargetType[];
  };
}

export interface RefundLeg {
  kind: string;
  descriptionInr: string;
  amountInr: string;
  destination?: string;
}

export interface CancelPreviewResponse {
  ok: true;
  canCancel: boolean;
  blockedReason?: string;
  cancelMode?: 'INSTANT' | 'PENDING_CONFIRMATION';
  refundsRequired: RefundLeg[];
}

export interface CancelByCustomerResponse {
  ok?: true;
  newStatus: 'CANCELLED' | 'CANCELLATION_PENDING';
  refunds: RefundLeg[];
}

export interface ReturnByNumberResponse {
  ok: true;
  return: {
    returnNumber: string;
    status: ReturnStatus;
    resolution: Resolution;
    quantity: number;
    reason: {
      code: string;
      label: string;
      detailedCode: string | null;
      detailedLabel: string | null;
      freeText: string | null;
    };
    customerImages: string[];
    customerNotes: string | null;
    timestamps: Record<string, string | null>;
    rejectedReason: string | null;
    events: TimelineEntry[];
  };
  meta: { cookieCapabilities: Capability[] };
}

export interface RrCancelPreviewResponse {
  ok: true;
  canCancel: boolean;
  blockedReason?: string;
  refundsRequired: Array<{
    kind: 'PRICE_DIFF_REFUND';
    descriptionInr: string;
    amountInr: string;
  }>;
}

export interface RrCancelResponse {
  ok: true;
  returnNumber: string;
  newStatus: ReturnStatus;
}

export interface PayExchangeDiffResponse {
  ok: true;
  razorpayOrderId: string;
  amount: number; // rupees
  currency: 'INR';
}

export interface PayExchangeDiffVerifyResponse {
  ok: true;
  returnNumber: string;
  returnRequestId: string;
}

/* ------------------------------------------------------------------ */
/* GET /products/{productId}/variants                                 */
/* ------------------------------------------------------------------ */

export interface ProductVariantsResponse {
  ok: true;
  productId: string;
  variants: Array<{
    variantId: string;
    label: string;
    priceInr: string;
    stock: number;
    inStock: boolean;
    imageUrl: string | null;
    weightKg: number | null;
    dims: { lCm: number | null; bCm: number | null; hCm: number | null };
  }>;
}

/* ------------------------------------------------------------------ */
/* Tax invoice OTP-gated PDF download / email resend                  */
/* ------------------------------------------------------------------ */

/**
 * POST /api/{storeId}/storefront/orders/{orderId}/invoice/request-otp
 *
 * Always returns `{ ok: true }` regardless of whether an email was sent
 * (anti-enumeration discipline). Show a generic "If we have your email on
 * file, we've sent a 6-digit code" message — never disclose whether the
 * order / email exists.
 */
export interface InvoiceRequestOtpResponse {
  ok: true;
}

/**
 * POST /api/{storeId}/storefront/orders/{orderId}/invoice/verify-otp
 * Body: `{ code: string }`
 *
 * On success: a short-lived (5 min) HMAC-signed `token` + a fully-formed
 * `downloadUrl` the storefront can navigate to directly.  On failure the
 * server returns a non-2xx shape with `{ ok: false, error, attemptsLeft? }`.
 */
export interface InvoiceVerifyOtpResponse {
  ok: true;
  token: string; // short-lived (5 min); reuse for email-resend + contact-hints
  downloadUrl: string; // fully-formed PDF URL; navigate to it to trigger download
}

/**
 * POST /api/{storeId}/storefront/orders/{orderId}/invoice/email-resend
 * Body: `{ token: string }` — must be a short-lived `kind === 'short'` token
 * from a fresh `verify-otp`.
 *
 * Always returns `{ ok: true }` (anti-enumeration).
 */
export interface InvoiceEmailResendResponse {
  ok: true;
}

/**
 * GET /api/{storeId}/storefront/orders/{orderId}/contact-hints?token=<short>
 *
 * Returns a masked email (e.g. `al••@gmail.com`) so the success toast can
 * show where the invoice was sent without leaking the full address.
 * `emailMask` is `null` when the token is bad/expired or no email is on file.
 */
export interface ContactHintsResponse {
  ok: true;
  emailMask: string | null;
}

/* ------------------------------------------------------------------ */
/* B2B buyer block                                                    */
/* ------------------------------------------------------------------ */

/**
 * Optional `buyer` block included in the checkout POST body when the
 * customer claims a GST invoice.  Validated client-side (format + Mod-36)
 * and again server-side.
 */
export interface BuyerBlock {
  gstin: string; // 15-char, uppercase
  legalName: string; // required when gstin present
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string; // defaults to 'IN'
  };
  pan?: string; // optional; 10-char PAN
}
