'use client';

import { Product } from '@/types';
import ProductCard from '@/components/ui/product-card';
import { ProductCarousel } from '@/components/ui/carousel';
import { useInView } from '@/hooks/use-in-view';

interface NewArrivalsSectionProps {
  products: Product[];
}

const NewArrivalsSection: React.FC<NewArrivalsSectionProps> = ({ products }) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className={`w-full py-10 scroll-animate ${isInView ? 'in-view' : ''}`}>
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