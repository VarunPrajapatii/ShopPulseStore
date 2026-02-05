'use client';

import Gallery from '@/components/gallery';
import Info from '@/components/info';
import ProductList from '@/components/product-list';
import Container from '@/components/ui/container';
import { Product } from '@/types';

interface ProductPageClientProps {
  product: Product;
  suggestedProducts: Product[];
}

const ProductPageClient: React.FC<ProductPageClientProps> = ({ 
  product, 
  suggestedProducts 
}) => {
  return (
    <div className='bg-white'>
      <Container>
        <article className='px-4 py-10 sm:px-6 lg:px-8'>
          <div className='lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8'>
            <div className="animate-fade-in">
              <Gallery images={product?.images || []} />
            </div>
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 animate-fade-in" style={{ animationDelay: '150ms' }}>
              <Info data={product} />
            </div>
          </div>
          <hr className='my-10 text-gray-300' />
          <section className="animate-fade-in-up" >
            <ProductList title="Related Items" items={suggestedProducts} />
          </section>
        </article>
      </Container>
    </div>
  );
};

export default ProductPageClient;
