const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface StockAlertResponse {
  'alert-acknowledged': boolean;
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
}

const sendStockAlert = async (productId: string): Promise<StockAlertResponse | null> => {
  try {
    if (!productId) {
      return null;
    }

    const url = `${API_URL}/stock-alert/${productId}`;
    
    const res = await fetch(url, {
      method: 'POST',
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error(`Failed to send stock alert: ${res.status}`);
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
    console.error('Error sending stock alert:', error);
    return null;
  }
};

export default sendStockAlert;
