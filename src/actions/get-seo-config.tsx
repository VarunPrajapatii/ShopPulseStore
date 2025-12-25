import { StoreSEOConfig } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getSEOConfig = async (): Promise<StoreSEOConfig | null> => {
  try {
    // Extract storeId from API_URL (format: http://domain/api/{storeId})
    const storeId = API_URL?.split('/').pop();
    if (!storeId) {
      console.error('No storeId found in API_URL');
      return null;
    }

    const URL = `${API_URL}/seo-config`;
    const res = await fetch(URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour (SEO config rarely changes)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    console.log('Fetched SEO config for storeId:', storeId, await res.clone().json());
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching SEO config:', error);
    return null;
  }
};

export default getSEOConfig;
