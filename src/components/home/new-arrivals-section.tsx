import { Product } from '@/types';
import ProductCard from '@/components/ui/product-card';
import { ProductCarousel } from '@/components/ui/carousel';

interface NewArrivalsSectionProps {
  products: Product[];
}

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10">
      <ProductCarousel
        title="New Arrivals"
        subtitle="Fresh picks just for you"
        showViewAll
        viewAllHref="/"
      >
        {products.map((product) => (
          <ProductCard key={product.id} data={product} isNewArrival />
        ))}
      </ProductCarousel>
    </section>
  );
};

export default NewArrivalsSection;