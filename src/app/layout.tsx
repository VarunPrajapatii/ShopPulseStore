import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import ModalProvider from "@/providers/modal-provider";
import ToastProvider from "@/providers/toast-provider";
import getCategories from "@/actions/get-categories";
import CategoriesHydration from "@/components/categories-hydration";
import getStoreBillboards from "@/actions/get-store-billboards";
import StoreBillboardsHydration from "@/components/store-billboards-hydration";
import getSEOConfig from "@/actions/get-seo-config";

const font = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const seoConfig = await getSEOConfig();

  if (!seoConfig) {
    return {
      title: "Store - NextJS Ecommerce",
      description: "Its a ecommerce store built with nextjs 15",
      icons: {
        icon: [{ url: "/storelogo.png", type: "image/png" }],
        shortcut: ["/storelogo.png"],
        apple: [{ url: "/storelogo.png", type: "image/png" }]
      },
    };
  }

  return {
    title: {
      default: seoConfig.defaultTitle,
      template: `%s | ${seoConfig.storeName}`,
    },
    description: seoConfig.defaultDescription,
    keywords: seoConfig.keywords,
    authors: [{ name: seoConfig.storeName }],
    creator: seoConfig.storeName,
    publisher: seoConfig.storeName,
    metadataBase: new URL(seoConfig.storeUrl),
    icons: {
      icon: seoConfig.logoUrl ? [{ url: seoConfig.logoUrl, type: "image/png" }] : [{ url: "/storelogo.png", type: "image/png" }],
      shortcut: seoConfig.logoUrl ? [seoConfig.logoUrl] : ["/storelogo.png"],
      apple: seoConfig.logoUrl ? [{ url: seoConfig.logoUrl, type: "image/png" }] : [{ url: "/storelogo.png", type: "image/png" }]
    },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: seoConfig.storeUrl,
      siteName: seoConfig.storeName,
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      images: seoConfig.logoUrl ? [{
        url: seoConfig.logoUrl,
        alt: seoConfig.storeName,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      images: seoConfig.logoUrl ? [seoConfig.logoUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const categories = await getCategories();
  const storeBillboards = await getStoreBillboards();
  const seoConfig = await getSEOConfig();
  
  // Organization Schema (JSON-LD)
  const organizationSchema = seoConfig ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.storeName,
    url: seoConfig.storeUrl,
    logo: seoConfig.logoUrl || undefined,
    sameAs: [
      seoConfig.socialLinks?.facebook,
      seoConfig.socialLinks?.instagram,
      seoConfig.socialLinks?.twitter,
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      url: `${seoConfig.storeUrl}/contact-us`,
    },
  } : null;

  // WebSite Schema
  const websiteSchema = seoConfig ? {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.storeName,
    url: seoConfig.storeUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.storeUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  } : null;
  
  return (
    <html lang="en">
      <head>
        {/* JSON-LD Structured Data */}
        {organizationSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
        )}
        {websiteSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
        )}
      </head>
      <body
        className={`${font.className} antialiased`}
      >
        <ModalProvider />
        <ToastProvider/>
        <CategoriesHydration categories={categories} />
        <StoreBillboardsHydration storeBillboards={storeBillboards} />
        <Navbar />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
