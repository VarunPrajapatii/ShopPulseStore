import { Product } from '@/types';
import ProductCard from '@/components/ui/product-card';
import { ProductCarousel } from '@/components/ui/carousel';

interface FeaturedProductsSectionProps {
  products: Product[];
}

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10">
      <ProductCarousel
        title="Featured Products"
        subtitle="Handpicked for you"
      >
        {products.map((product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </ProductCarousel>
    </section>
  );
};

export default FeaturedProductsSection;
