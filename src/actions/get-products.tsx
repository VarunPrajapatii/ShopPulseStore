import { Product } from '@/types';
import qs from 'query-string';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const URL = `${API_URL}/products`;

interface Query {
  categoryId?: string;
  featured?: boolean;
  filter?: 'new-arrivals';
}

/**
 * Unified products fetching function
 * 
 * Usage:
 * - All products: getProducts({})
 * - Featured products: getProducts({ featured: true })
 * - Category products: getProducts({ categoryId: 'xxx' })
 * - Featured in category: getProducts({ categoryId: 'xxx', featured: true })
 * - New arrivals: getProducts({ filter: 'new-arrivals' })
 */
const getProducts = async (query: Query = {}): Promise<Product[]> => {
  try {
    const url = qs.stringifyUrl({
      url: URL,
      query: { 
        categoryId: query.categoryId,
        featured: query.featured,
        filter: query.filter,
      },
    });
    
    const res = await fetch(url, {
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
    console.error('Error fetching products:', error);
    return [];
  }
};

export default getProducts;
