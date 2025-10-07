import getProduct from '@/actions/get-product';
import getProducts from '@/actions/get-products';
import Gallery from '@/components/gallery';
import Info from '@/components/info';
import ProductList from '@/components/product-list';
import Container from '@/components/ui/container';
import React from 'react'

interface ProductPageProps {
    params: {
        productId: string;
    }
}

const ProductPage: React.FC<ProductPageProps> = async ({ params }) => {
  const { productId } = await params;
  const product = await getProduct(productId);
  
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

  return (
    <div className='bg-white'>
        <Container>
            <div className='px-4 py-10 sm:px-6 lg:px-8'>
                <div className='lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8'>
                    <Gallery images={product?.images || []} />
                    <div className='mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0'>
                        <Info data={product} />
                    </div>

                </div>
                <hr className='my-10' />
                <ProductList title="Related Items" items={suggestedProducts} />
            </div>
        </Container>
    </div>
  )
}

export default ProductPage