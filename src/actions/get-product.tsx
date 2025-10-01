import { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/8ce60fbe-1d23-42f8-8506-6a65dec6aa77';
const URL = `${API_URL}/products`;

const getProduct = async (id: string): Promise<Product | null> => {
  try {
    
    const res = await fetch(`${URL}/${id}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    const data = await res.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export default getProduct;
