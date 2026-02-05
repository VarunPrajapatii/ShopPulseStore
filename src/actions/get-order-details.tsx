const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId?: string | null;   // For variant tracking
  priceAtPurchase: number;
  quantity: number;
  productSize: string | null;         // Size name for display
  productSizeValue?: string | null;   // Size value (e.g., "Small", "Medium")
  productName: string;
  productImageUrl: string | null;
  productSku?: string | null;  // SKU from product or variant
  lineTotal: number;
  productStatus: "available" | "archived" | "deleted";
  
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
  orderStatus: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  
  // Customer Info
  name: string;
  email: string;
  phone: string;
  
  // Shipping Address (now structured)
  shippingAddress: ShippingAddress;
  address?: string; // Legacy fallback
  
  // Payment Details
  paymentMethod: 'PREPAID' | 'COD';
  codAmount: number | null;            // Amount to collect for COD orders
  
  // Pricing Breakdown
  subtotal: number;
  tax: number;
  shippingCost: number;
  shippingEstimate: number | null;     // Original estimate shown at checkout
  totalAmount: number;
  
  // Razorpay Details (PREPAID only)
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
}

const getOrderDetails = async (orderId: string): Promise<OrderDetails | null> => {
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
    
    const data = await res.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

export default getOrderDetails;
