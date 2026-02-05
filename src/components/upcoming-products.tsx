'use client';

import React from 'react';
import { UpcomingProduct } from '@/types';
import UpcomingProductCard from '@/components/ui/upcoming-product-card';
import { ProductCarousel } from '@/components/ui/carousel';
import { useInView } from '@/hooks/use-in-view';

interface UpcomingProductsProps {
  items: UpcomingProduct[];
}

const UpcomingProducts: React.FC<UpcomingProductsProps> = ({ items }) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className={`w-full py-10 scroll-animate ${isInView ? 'in-view' : ''}`}>
      <ProductCarousel
        title="Coming Soon"
        subtitle="Exciting new products on the way"
      >
        {items.map((item) => (
          <UpcomingProductCard key={item.id} data={item} />
        ))}
      </ProductCarousel>
    </section>
  );
};

export default UpcomingProducts;