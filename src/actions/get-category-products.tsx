import { Product } from '@/types';

// Fallback to localhost if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/eccf35b7-f7c0-4cda-aae2-906da86c8314';

const getCategoryProducts = async (categoryId: string): Promise<Product[]> => {
  try {
    const URL = `${API_URL}/categories/${categoryId}/products`;
    
    const res = await fetch(URL, {
      cache: 'no-store',
    });
    
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
    console.error('Error fetching category products:', error);
    return [];
  }
};

export default getCategoryProducts;
