import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL =
  process.env.NEXT_PUBLIC_STORE_URL || 'https://store.example.com';

interface SitemapImage {
  url: string;
  altText: string | null;
}

interface SitemapProduct {
  id: string;
  name: string;
  images: SitemapImage[];
}

interface SitemapCategory {
  id: string;
  name: string;
  imageUrl?: string;
  imageAltText?: string | null;
}

interface SitemapBillboard {
  id: string;
  label: string;
  imageUrl: string;
  imageAltText?: string | null;
}

interface SitemapStoreInfo {
  promotionalBanner?: string | null;
  promotionalBannerAltText?: string | null;
}

interface SitemapUpcomingProduct {
  id: string;
  name: string;
  imageUrl: string;
}

async function fetchProducts(): Promise<SitemapProduct[]> {
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<SitemapCategory[]> {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchBillboards(): Promise<SitemapBillboard[]> {
  try {
    const res = await fetch(`${API_URL}/billboards`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchStoreInfo(): Promise<SitemapStoreInfo | null> {
  try {
    const res = await fetch(`${API_URL}/stores`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchUpcomingProducts(): Promise<SitemapUpcomingProduct[]> {
  try {
    const res = await fetch(`${API_URL}/upcoming-products`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [products, categories, billboards, storeInfo, upcomingProducts] =
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchBillboards(),
      fetchStoreInfo(),
      fetchUpcomingProducts(),
    ]);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Product pages with all their images
  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    xml += `  <url>
    <loc>${escapeXml(`${SITE_URL}/product/${product.id}`)}</loc>
`;
    for (let i = 0; i < product.images.length; i++) {
      const img = product.images[i];
      if (!img.url) continue;
      const title = escapeXml(
        img.altText || `${product.name} - Image ${i + 1}`
      );
      xml += `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${title}</image:caption>
    </image:image>
`;
    }
    xml += `  </url>
`;
  }

  // Category pages with their images
  for (const category of categories) {
    if (!category.imageUrl) continue;
    const title = escapeXml(category.imageAltText || category.name);
    xml += `  <url>
    <loc>${escapeXml(`${SITE_URL}/category/${category.id}`)}</loc>
    <image:image>
      <image:loc>${escapeXml(category.imageUrl)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${title}</image:caption>
    </image:image>
  </url>
`;
  }

  // Homepage with billboard images
  if (billboards.length > 0) {
    xml += `  <url>
    <loc>${escapeXml(SITE_URL)}</loc>
`;
    for (const billboard of billboards) {
      if (!billboard.imageUrl) continue;
      const title = escapeXml(billboard.imageAltText || billboard.label);
      xml += `    <image:image>
      <image:loc>${escapeXml(billboard.imageUrl)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${title}</image:caption>
    </image:image>
`;
    }
    xml += `  </url>
`;
  }

  // Homepage promotional banner image
  if (storeInfo?.promotionalBanner) {
    const bannerTitle = escapeXml(
      storeInfo.promotionalBannerAltText || 'Promotional Banner'
    );
    // Append to existing homepage <url> or create new one
    xml += `  <url>
    <loc>${escapeXml(SITE_URL)}</loc>
    <image:image>
      <image:loc>${escapeXml(storeInfo.promotionalBanner)}</image:loc>
      <image:title>${bannerTitle}</image:title>
      <image:caption>${bannerTitle}</image:caption>
    </image:image>
  </url>
`;
  }

  // Upcoming product images (shown on homepage)
  for (const upcoming of upcomingProducts) {
    if (!upcoming.imageUrl) continue;
    const title = escapeXml(upcoming.name);
    xml += `  <url>
    <loc>${escapeXml(SITE_URL)}</loc>
    <image:image>
      <image:loc>${escapeXml(upcoming.imageUrl)}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${title}</image:caption>
    </image:image>
  </url>
`;
  }

  xml += `</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
