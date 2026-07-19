const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Backend may return decimal monetary/rate fields as strings or numbers.
// Using this alias on the raw response types makes the ambiguity explicit.
type Numeric = number | string;

// ---------------------------------------------------------------------------
// Public interfaces — all numeric fields are guaranteed to be `number` after
// normalization. These are the types consumed by the rest of the app.
// ---------------------------------------------------------------------------

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId?: string | null; // For variant tracking
  priceAtPurchase: number;
  quantity: number;
  productSize: string | null; // Size name for display
  productSizeValue?: string | null; // Size value (e.g., "Small", "Medium")
  productName: string;
  productImageUrl: string | null;
  productSku?: string | null; // SKU from product or variant
  lineTotal: number;
  productStatus: 'available' | 'archived' | 'deleted';

  // GST / Tax snapshot (null when not yet computed or pre-tax legacy order)
  taxableAmount: number | null;
  cgstRate: number | null;
  cgstAmount: number | null;
  sgstRate: number | null;
  sgstAmount: number | null;
  igstRate: number | null;
  igstAmount: number | null;
  cessRate: number | null;
  cessAmount: number | null;
  hsnCodeSnapshot: string | null;

  // If product is still available
  currentProduct?: {
    id: string;
    name: string;
    price: number;
    sellingPrice: number | null;
    imageUrl: string;
  };
  currentVariant?: {
    id: string;
    sizeName: string;
    sizeValue: string;
    currentStock: number;
  };

  // If product was archived
  archivedProduct?: {
    id: string;
    originalProductId: string;
    name: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    sizeName: string;
    sizeValue: string;
    archivedAt: string;
    archiveReason: string;
  };
}

export interface ShippingAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderDetails {
  orderId: string;
  orderItems: OrderItem[];
  isPaid: boolean;
  orderStatus:
    | 'PENDING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';

  // Customer Info
  name: string;
  email: string;
  phone: string;

  // Shipping Address (now structured)
  shippingAddress: ShippingAddress;
  address?: string; // Legacy fallback

  // Payment Details
  paymentMethod: 'PREPAID' | 'COD';
  codAmount: number | null; // Amount to collect for COD orders

  // Pricing Breakdown
  subtotal: number;
  tax: number;
  shippingCost: number;
  shippingEstimate: number | null; // Original estimate shown at checkout
  totalAmount: number;

  // Razorpay Details (PREPAID only)
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;

  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;

  // B2B / GST Invoice fields (null for B2C orders)
  buyerGstin: string | null;
  buyerLegalName: string | null;
  buyerStateCode: string | null;
  buyerBillingAddress: ShippingAddress | null;
  buyerPan: string | null;
  sellerGstin: string | null;
  placeOfSupply: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  invoiceFy: string | null;
}

// ---------------------------------------------------------------------------
// Internal raw response types — mirrors the public interfaces but uses
// `Numeric` (number | string) for every monetary / rate field so that the
// TypeScript compiler forces explicit conversion before the data leaves this
// module.
// ---------------------------------------------------------------------------

interface RawOrderItem extends Omit<
  OrderItem,
  | 'priceAtPurchase'
  | 'lineTotal'
  | 'taxableAmount'
  | 'cgstRate'
  | 'cgstAmount'
  | 'sgstRate'
  | 'sgstAmount'
  | 'igstRate'
  | 'igstAmount'
  | 'cessRate'
  | 'cessAmount'
  | 'currentProduct'
  | 'archivedProduct'
> {
  priceAtPurchase: Numeric;
  lineTotal: Numeric;
  taxableAmount: Numeric | null;
  cgstRate: Numeric | null;
  cgstAmount: Numeric | null;
  sgstRate: Numeric | null;
  sgstAmount: Numeric | null;
  igstRate: Numeric | null;
  igstAmount: Numeric | null;
  cessRate: Numeric | null;
  cessAmount: Numeric | null;
  currentProduct?: {
    id: string;
    name: string;
    price: Numeric;
    sellingPrice: Numeric | null;
    imageUrl: string;
  };
  archivedProduct?: {
    id: string;
    originalProductId: string;
    name: string;
    price: Numeric;
    imageUrl: string;
    categoryName: string;
    sizeName: string;
    sizeValue: string;
    archivedAt: string;
    archiveReason: string;
  };
}

interface RawOrderDetails extends Omit<
  OrderDetails,
  | 'orderItems'
  | 'codAmount'
  | 'subtotal'
  | 'tax'
  | 'shippingCost'
  | 'shippingEstimate'
  | 'totalAmount'
> {
  orderItems: RawOrderItem[];
  codAmount: Numeric | null;
  subtotal: Numeric;
  tax: Numeric;
  shippingCost: Numeric;
  shippingEstimate: Numeric | null;
  totalAmount: Numeric;
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

/** Converts a backend value that may be a decimal string to a number. */
function toNumber(val: Numeric): number {
  if (typeof val === 'number') return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
}

/** Same as toNumber but preserves null/undefined as null. */
function toNumberOrNull(val: Numeric | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return val;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Normalization — converts all Numeric fields to actual numbers before the
// data is returned to the rest of the app.
// ---------------------------------------------------------------------------

function normalizeOrderDetails(raw: RawOrderDetails): OrderDetails {
  return {
    ...raw,
    codAmount: toNumberOrNull(raw.codAmount),
    subtotal: toNumber(raw.subtotal),
    tax: toNumber(raw.tax),
    shippingCost: toNumber(raw.shippingCost),
    shippingEstimate: toNumberOrNull(raw.shippingEstimate),
    totalAmount: toNumber(raw.totalAmount),
    orderItems: raw.orderItems.map(
      (item): OrderItem => ({
        ...item,
        priceAtPurchase: toNumber(item.priceAtPurchase),
        lineTotal: toNumber(item.lineTotal),
        taxableAmount: toNumberOrNull(item.taxableAmount),
        cgstRate: toNumberOrNull(item.cgstRate),
        cgstAmount: toNumberOrNull(item.cgstAmount),
        sgstRate: toNumberOrNull(item.sgstRate),
        sgstAmount: toNumberOrNull(item.sgstAmount),
        igstRate: toNumberOrNull(item.igstRate),
        igstAmount: toNumberOrNull(item.igstAmount),
        cessRate: toNumberOrNull(item.cessRate),
        cessAmount: toNumberOrNull(item.cessAmount),
        currentProduct: item.currentProduct
          ? {
              ...item.currentProduct,
              price: toNumber(item.currentProduct.price),
              sellingPrice: toNumberOrNull(item.currentProduct.sellingPrice),
            }
          : undefined,
        archivedProduct: item.archivedProduct
          ? {
              ...item.archivedProduct,
              price: toNumber(item.archivedProduct.price),
            }
          : undefined,
      })
    ),
  };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

const getOrderDetails = async (
  orderId: string
): Promise<OrderDetails | null> => {
  try {
    if (!orderId) {
      return null;
    }

    const url = `${API_URL}/order/${orderId}`;

    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh data for order details
    });

    if (!res.ok) {
      console.error(`Failed to fetch order details: ${res.status}`);
      return null;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON');
      return null;
    }

    const data: RawOrderDetails = await res.json();

    return normalizeOrderDetails(data);
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

export default getOrderDetails;
