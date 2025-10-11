import { StoreBillboard } from '@/types';

// Fallback to localhost if environment variable is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/1e294491-aea8-4816-8f34-f689a8d5d207';
const URL = `${API_URL}/store-billboards`;

const getStoreBillboards = async (): Promise<StoreBillboard[]> => {
  try {
    const res = await fetch(URL);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching store billboards:', error);
    return [];
  }
};

export default getStoreBillboards;
