import { Billboard } from '@/types';

const URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`;

const getCategoryBillboards = async (categoryId: string): Promise<Billboard[]> => {
  try {
    const res = await fetch(`${URL}/${categoryId}`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    const data = await res.json();
    console.log('Fetch response1:', data);
    return data.billboards || [];
  } catch (error) {
    console.error('Error fetching category billboards:', error);
    // Return empty array if fetch fails
    return [];
  }
};

export default getCategoryBillboards;
