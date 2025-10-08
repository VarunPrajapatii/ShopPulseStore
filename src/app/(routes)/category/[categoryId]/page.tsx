import getCategoryProducts from "@/actions/get-category-products";
import CategoryBillboardsClient from "@/components/category-billboards-client";
import CategoryHeader from "@/components/category-header";
import CategoryProductsClient from "@/components/category-products-client";
import Container from "@/components/ui/container";

export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { categoryId } = await params;
  const products = await getCategoryProducts(categoryId);

  return (
    <Container>
      <div className="space-y-10 pb-10">
        {/* Category Billboards */}
        <CategoryBillboardsClient categoryId={categoryId} />

        {/* Category Header */}
        <CategoryHeader categoryId={categoryId} />

        {/* Products Section with Sorting */}
        <div className="px-4 sm:px-6 lg:px-8">
          <CategoryProductsClient products={products} />
        </div>
      </div>
    </Container>
  );
};

export default CategoryPage;
