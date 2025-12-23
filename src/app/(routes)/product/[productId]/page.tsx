import getProduct from '@/actions/get-product';
import getSEOConfig from '@/actions/get-seo-config';
// import getProducts from '@/actions/get-products';
import Gallery from '@/components/gallery';
import Info from '@/components/info';
import ProductList from '@/components/product-list';
import Container from '@/components/ui/container';
import React from 'react'
import { Metadata } from 'next';

interface ProductPageProps {
    params: Promise<{
        productId: string;
    }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await getProduct(productId);
  const seoConfig = await getSEOConfig();

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    };
  }

  const storeName = seoConfig?.storeName || 'Shop';
  const storeUrl = seoConfig?.storeUrl || '';
  const productUrl = `${storeUrl}/product/${product.id}`;

  return {
    title: `${product.name} | ${storeName}`,
    description: product.description || `Buy ${product.name} at ${storeName}. ${product.bulletPoints?.slice(0, 2).join('. ')}.`,
    keywords: [
      product.name,
      product.category?.name || '',
      ...(seoConfig?.keywords || []),
    ],
    openGraph: {
      title: product.name,
      description: product.description,
      url: productUrl,
      siteName: storeName,
      images: product.images?.map(img => ({
        url: img.url,
        alt: product.name,
      })) || [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: product.images?.[0]?.url ? [product.images[0].url] : [],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

const ProductPage: React.FC<ProductPageProps> = async ({ params }) => {
  const { productId } = await params;
  const product = await getProduct(productId);
  const seoConfig = await getSEOConfig();
  
  if (!product) {
    return (
      <div className='bg-white'>
        <Container>
          <div className='px-4 py-10 sm:px-6 lg:px-8'>
            <div className='text-center'>
              <h1 className='text-2xl font-bold text-gray-900'>Product not found</h1>
              <p className='mt-2 text-gray-600'>The product you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }
  
  const suggestedProducts = product.relatedItems;
  const storeUrl = seoConfig?.storeUrl || '';
  const storeName = seoConfig?.storeName || 'Shop';

  // Product Schema (JSON-LD)
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images?.map(img => img.url) || [],
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `${storeUrl}/product/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.stockQuantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: storeName,
      },
    },
    brand: {
      '@type': 'Brand',
      name: storeName,
    },
    category: product.category?.name,
  };

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: storeUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category?.name || 'Products',
        item: `${storeUrl}/category/${product.category?.id}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${storeUrl}/product/${product.id}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className='bg-white'>
        <Container>
          <article className='px-4 py-10 sm:px-6 lg:px-8'>
            <div className='lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8'>
              <Gallery images={product?.images || []} />
              <div className='mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0'>
                <Info data={product} />
              </div>
            </div>
            <hr className='my-10' />
            <section>
              <ProductList title="Related Items" items={suggestedProducts} />
            </section>
          </article>
        </Container>
      </div>
    </>
  )
}

export default ProductPage