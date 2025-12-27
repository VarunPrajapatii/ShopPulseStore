'use client';

import React from 'react';
import { UpcomingProduct } from '@/types';
import UpcomingProductCard from '@/components/ui/upcoming-product-card';
import { ProductCarousel } from '@/components/ui/carousel';

interface UpcomingProductsProps {
  items: UpcomingProduct[];
}

const UpcomingProducts: React.FC<UpcomingProductsProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-10">
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