import { AnnouncementBar } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAnnouncementBar = async (): Promise<AnnouncementBar | null> => {
  try {
    const res = await fetch(`${API_URL}/announcement-bar`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Response is not JSON');
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching announcement bar:', error);
    return null;
  }
};

export default getAnnouncementBar;
