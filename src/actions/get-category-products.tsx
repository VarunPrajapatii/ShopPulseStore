import { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get products for a specific category using unified products endpoint
 * Uses: GET /api/{storeId}/products?categoryId={categoryId}
 */
const getCategoryProducts = async (categoryId: string): Promise<Product[]> => {
  try {
    const URL = `${API_URL}/products?categoryId=${categoryId}`;
    
    const res = await fetch(URL, {
      next: { revalidate: 60 }, // Cache for 1 minute
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
