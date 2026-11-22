import type { MetadataRoute } from 'next';
import { storeUrlFallback } from '@/config/site';

const SITE_URL = process.env.NEXT_PUBLIC_STORE_URL || storeUrlFallback;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout', '/order-success', '/cart'],
    },
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/image-sitemap.xml`],
  };
}
