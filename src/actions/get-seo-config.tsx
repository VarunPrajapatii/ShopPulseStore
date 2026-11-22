import { StoreSEOConfig } from '@/types';
import { API_URL, getStoreId } from '@/lib/api-base';

const getSEOConfig = async (): Promise<StoreSEOConfig | null> => {
  try {
    if (!API_URL || !getStoreId()) {
      console.error('No storeId found in API_URL');
      return null;
    }

    const URL = `${API_URL}/seo-config`;
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

    return res.json();
  } catch (error) {
    console.error('Error fetching SEO config:', error);
    return null;
  }
};

export default getSEOConfig;
