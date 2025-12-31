import getProducts from "@/actions/get-products";
import getSEOConfig from "@/actions/get-seo-config";
import getCategories from "@/actions/get-categories";
import getStoreInfo from "@/actions/get-store-info";
import getNewArrivals from "@/actions/get-new-arrivals";
import getUpcomingProducts from "@/actions/get-upcoming-products";

import Container from "@/components/ui/container";
import StoreBillboardsClient from "@/components/store-billboards-client";
import Marquee from "@/components/marquee";
import UpcomingProducts from "@/components/upcoming-products";
import { CategoryCarousel } from "@/components/ui/carousel";
import {
  ValuePropositionBar,
  PromotionalBanner,
  NewArrivalsSection,
  FeaturedProductsSection,
  NewsletterSection,
  OurStorySection,
  WhyChooseUsSection,
} from "@/components/home";
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
    description: seoConfig.defaultDescription || "Shop the latest products",
    keywords: seoConfig.keywords || undefined,
    openGraph: {
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription || "Shop the latest products",
      ...(seoConfig.storeUrl && { url: seoConfig.storeUrl }),
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
      description: seoConfig.defaultDescription || "Shop the latest products",
      images: seoConfig.logoUrl ? [seoConfig.logoUrl] : [],
    },
  };
}

const HomePage = async () => {
  // Fetch all data in parallel
  const [
    featuredProducts,
    upcomingProducts,
    seoConfig,
    categories,
    storeInfo,
    newArrivals,
  ] = await Promise.all([
    getProducts({ featured: true }),
    getUpcomingProducts({}),
    getSEOConfig(),
    getCategories(),
    getStoreInfo(),
    getNewArrivals(),
  ]);

  console.log('Store Info:', storeInfo);

  return (
    <>
      {/* 1. Announcement Bar - Handled in layout (above navbar) */}
      {/* 2. Navbar - Sticky, handled in layout */}
      
      {/* Visually hidden h1 for SEO */}
      <h1 className="sr-only">
        {seoConfig?.storeName || 'Store'} - {seoConfig?.defaultTitle || 'Home'}
      </h1>
      
      {/* 3. Hero Billboard - Full width, edge-to-edge */}
      <StoreBillboardsClient />
      
      <Container>
        {/* 4. Shop by Category - Horizontal swipe */}
        <CategoryCarousel categories={categories} />
        
        {/* 5. Featured Products - Horizontal swipe */}
        <FeaturedProductsSection products={featuredProducts} />
        
        {/* 6. Our Story Section */}
        <OurStorySection />
        
        {/* 7. Marquee - Visual break */}
        <Marquee />
        
        {/* 8. Value Proposition Bar */}
        <ValuePropositionBar />
        
        {/* 9. Promotional Banner - Full width image */}
        <PromotionalBanner imageUrl={storeInfo?.promotionalBanner} />
        
        {/* 10. New Arrivals */}
        <NewArrivalsSection products={newArrivals} />
        
        {/* 11. Why Choose Us */}
        <WhyChooseUsSection />
        
        {/* 12. Upcoming Products */}
        <UpcomingProducts items={upcomingProducts} />
      </Container>
      
      {/* 13. Newsletter Signup - Full width, outside container */}
      <NewsletterSection />
      
      {/* 14. Footer - Handled in layout */}
    </>
  );
};

export default HomePage;