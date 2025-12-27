import { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getNewArrivals = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products?filter=new-arrivals`, {
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
    console.error('Error fetching new arrivals:', error);
    return [];
  }
};

export default getNewArrivals;
