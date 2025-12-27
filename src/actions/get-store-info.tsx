import { StoreInfo } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getStoreInfo = async (): Promise<StoreInfo | null> => {
  try {
    const res = await fetch(`${API_URL}/stores`, {
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
    console.error('Error fetching store info:', error);
    return null;
  }
};

export default getStoreInfo;
