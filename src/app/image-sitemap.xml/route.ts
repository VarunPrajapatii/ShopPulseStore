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

interface SitemapStoreBillboard {
  billboard: SitemapBillboard;
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

async function fetchStoreBillboards(): Promise<SitemapStoreBillboard[]> {
  try {
    const res = await fetch(`${API_URL}/store-billboards`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function imageTag(url: string, title: string): string {
  const t = escapeXml(title);
  return `    <image:image>
      <image:loc>${escapeXml(url)}</image:loc>
      <image:title>${t}</image:title>
      <image:caption>${t}</image:caption>
    </image:image>
`;
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
  const [products, categories, storeBillboards, storeInfo, upcomingProducts] =
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchStoreBillboards(),
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
  // Homepage: saari images ek hi <url> block me
  let homepageImages = '';
  for (const { billboard } of storeBillboards) {
    if (!billboard?.imageUrl) continue;
    homepageImages += imageTag(
      billboard.imageUrl,
      billboard.imageAltText || billboard.label
    );
  }
  if (storeInfo?.promotionalBanner) {
    homepageImages += imageTag(
      storeInfo.promotionalBanner,
      storeInfo.promotionalBannerAltText || 'Promotional Banner'
    );
  }
  for (const upcoming of upcomingProducts) {
    if (!upcoming.imageUrl) continue;
    homepageImages += imageTag(upcoming.imageUrl, upcoming.name);
  }
  if (homepageImages) {
    xml += `  <url>
    <loc>${escapeXml(SITE_URL)}</loc>
${homepageImages}  </url>
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
