import getCategoryProducts from "@/actions/get-category-products";
import getCategories from "@/actions/get-categories";
import getSEOConfig from "@/actions/get-seo-config";
import CategoryBillboardsClient from "@/components/category-billboards-client";
import CategoryHeader from "@/components/category-header";
import CategoryProductsClient from "@/components/category-products-client";
import Container from "@/components/ui/container";
import { Metadata } from "next";

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const categories = await getCategories();
  const category = categories.find(cat => cat.id === categoryId);
  const seoConfig = await getSEOConfig();

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The category you are looking for could not be found.',
    };
  }

  const storeName = seoConfig?.storeName || 'Shop';
  const storeUrl = seoConfig?.storeUrl || '';
  const categoryUrl = `${storeUrl}/category/${category.id}`;

  return {
    title: `${category.name} | ${storeName}`,
    description: `Browse our collection of ${category.name.toLowerCase()} at ${storeName}. ${seoConfig?.defaultDescription || ''}`,
    keywords: [
      category.name,
      `${category.name} products`,
      `buy ${category.name}`,
      ...(seoConfig?.keywords || []),
    ],
    openGraph: {
      title: `${category.name} | ${storeName}`,
      description: `Browse our collection of ${category.name.toLowerCase()}`,
      url: categoryUrl,
      siteName: storeName,
      images: category.billboard?.[0]?.billboard?.imageUrl ? [{
        url: category.billboard[0].billboard.imageUrl,
        alt: category.name,
      }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} | ${storeName}`,
      description: `Browse our collection of ${category.name.toLowerCase()}`,
      images: category.billboard?.[0]?.billboard?.imageUrl ? [category.billboard[0].billboard.imageUrl] : [],
    },
    alternates: {
      canonical: categoryUrl,
    },
  };
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { categoryId } = await params;
  const products = await getCategoryProducts(categoryId);
  // Reuse categories from metadata generation (Next.js deduplicates this call)
  const categories = await getCategories();
  const category = categories.find(cat => cat.id === categoryId);
  // Reuse SEO config from metadata generation (Next.js deduplicates this call)
  const seoConfig = await getSEOConfig();

  if (!category) {
    return (
      <Container>
        <div className="px-4 py-10 text-center">
          <h1 className="text-2xl font-bold">Category not found</h1>
        </div>
      </Container>
    );
  }

  const storeUrl = seoConfig?.storeUrl || '';

  // CollectionPage Schema (for category pages)
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: `Browse our collection of ${category.name.toLowerCase()}`,
    url: `${storeUrl}/category/${category.id}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          url: `${storeUrl}/product/${product.id}`,
          image: product.images?.[0]?.url || '',
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.stockQuantity > 0 
              ? 'https://schema.org/InStock' 
              : 'https://schema.org/OutOfStock',
          },
        },
      })),
    },
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
        name: category.name,
        item: `${storeUrl}/category/${category.id}`,
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <Container>
        <article className="space-y-10 pb-10">
          {/* Category Billboards */}
          <CategoryBillboardsClient categoryId={categoryId} />

          {/* Category Header */}
          <CategoryHeader categoryId={categoryId} />

          {/* Products Section with Sorting */}
          <section className="px-4 sm:px-6 lg:px-8">
            <CategoryProductsClient products={products} />
          </section>
        </article>
      </Container>
    </>
  );
};

export default CategoryPage;
