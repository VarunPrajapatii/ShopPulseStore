'use client';

import { Product } from '@/types';
import NoResults from '@/components/ui/no-results';
import ProductCard from '@/components/ui/product-card';
import { useInView } from '@/hooks/use-in-view';

interface ProductListProps {
  title: string;
  items: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ title, items }) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <div ref={ref} className="space-y-4">
      <h2 className={`font-bold text-3xl scroll-animate ${isInView ? 'in-view' : ''}`}>{title}</h2>
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div 
            key={item.id}
            className={`scroll-animate ${isInView ? 'in-view' : ''}`}
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            <ProductCard data={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
