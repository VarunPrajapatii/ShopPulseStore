import getProducts from "@/actions/get-products";
import getSEOConfig from "@/actions/get-seo-config";
import ProductList from "@/components/product-list";
import Container from "@/components/ui/container";
import StoreBillboardsClient from "@/components/store-billboards-client";
import Marquee from "@/components/marquee";
import OurPurpose from "@/components/our-purpose";
import UpcomingProducts from "@/components/upcoming-products";
import getUpcomingProducts from "@/actions/get-upcoming-products";
import { Metadata } from "next";

export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSEOConfig();

  if (!seoConfig) {
    return {
      title: "Home",
      description: "Shop the latest products",
    };
  }

  return {
    title: "Home",
    description: seoConfig.defaultDescription,
    keywords: seoConfig.keywords,
    openGraph: {
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      url: seoConfig.storeUrl,
      siteName: seoConfig.storeName,
      images: seoConfig.logoUrl ? [{
        url: seoConfig.logoUrl,
        alt: seoConfig.storeName,
      }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      images: seoConfig.logoUrl ? [seoConfig.logoUrl] : [],
    },
  };
}

const HomePage = async () => {
  const products = await getProducts({ isFeatured: true });
  const upcomingProducts = await getUpcomingProducts({});
  const seoConfig = await getSEOConfig();

  return (
    <Container>
      {/* Visually hidden h1 for SEO */}
      <h1 className="sr-only">{seoConfig?.storeName || 'Store'} - {seoConfig?.defaultTitle || 'Home'}</h1>
      <div className="space-y-10 pb-10">
        <StoreBillboardsClient />
        <section className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
          <ProductList title="Featured Products" items={products} />
        </section>
        <OurPurpose />
        <Marquee />
        <UpcomingProducts items={upcomingProducts} />
      </div>
    </Container>
  );
};

export default HomePage;