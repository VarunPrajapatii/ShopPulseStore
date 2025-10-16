'use client';

import { Product } from '@/types';
import Image from 'next/image';
import IconButton from '@/components/ui/icon-button';
import { Expand, ShoppingCart } from 'lucide-react';
import Currency from '@/components/ui/currency';
import { useRouter } from 'next/navigation';
import usePreviewModal from '@/hooks/use-preview-modal';
import useCart from '@/hooks/use-cart';

interface ProductCardProps {
  data: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  const cart = useCart();
  const previewModal = usePreviewModal();
  const router = useRouter();
  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  }

  const onPreview: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // this stop propogation is going to override the fact that the main div has an onClick event
    e.stopPropagation();
    previewModal.onOpen(data);
  }

  const onAddToCart: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (data.stockQuantity > 0) {
      cart.addItem(data);
    }
  }

  const isOutOfStock = data.stockQuantity === 0;

  return (
    <div onClick={handleClick} className="bg-white group cursor-pointer rounded-xl  p-3 space-y-4">
      {/* images and actions */}
      <div className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden">
        <Image
          src={data?.images?.[0]?.url}
          alt={data.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover aspect-square rounded-md"
        />
        
        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Out of Stock
          </div>
        )}

        <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5">
          <div className='flex gap-x-6 justify-center'>
             <IconButton 
              onClick={onPreview}
              icon={<Expand size={20} className='text-gray-600' />}
             />
             {!isOutOfStock && (
               <IconButton 
                 onClick={onAddToCart}
                 icon={<ShoppingCart size={20} className='text-gray-600' />}
               />
             )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className='font-semibold text-lg'>
          {data.name}
        </p>
        {data.titlepoints && data.titlepoints.length > 0 && (
          <p className='text-xs text-gray-600 mt-1 line-clamp-1'>
            {data.titlepoints.join(' | ')}
          </p>
        )}
        {/* Low Stock Warning */}
        {data.stockQuantity <= data.lowStockThreshold && (
          <p className='text-xs text-red-600 font-semibold mt-1 animate-pulse'>
            Only {data.stockQuantity} remaining, Hurry Up!
          </p>
        )}
        <p className='text-sm text-gray-500 mt-1'>
          {data.category?.name}
        </p>
      </div>

      {/* Price */}
      <div className='flex items-center justify-between text-xl'>
        <Currency amount={data.price} />
      </div>
    </div>
  );
};

export default ProductCard;
