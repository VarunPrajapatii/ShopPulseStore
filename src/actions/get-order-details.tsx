const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface OrderItem {
  id: string;
  productId: string;
  priceAtPurchase: number;
  quantity: number;
  productSize: string;
  productName: string;
  productImageUrl: string;
  lineTotal: number;
}

export interface OrderDetails {
  orderId: string;
  orderItems: OrderItem[];
  isPaid: boolean;
  orderStatus: string;
  name: string;
  email: string;
  address: string;
  phone: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string;
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
