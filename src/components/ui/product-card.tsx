'use client';

import { Product } from '@/types';
import Image from 'next/image';
import IconButton from '@/components/ui/icon-button';
import { Expand, ShoppingCart, Sparkles } from 'lucide-react';
import Currency from '@/components/ui/currency';
import { useRouter } from 'next/navigation';
import usePreviewModal from '@/hooks/use-preview-modal';
import useCart from '@/hooks/use-cart';

interface ProductCardProps {
  data: Product;
  isNewArrival?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ data, isNewArrival = false }) => {
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
    <div onClick={handleClick} className="bg-card group cursor-pointer rounded-xl border border-border p-3 space-y-4 transition-shadow hover:shadow-md">
      {/* images and actions */}
      <div className="aspect-square rounded-xl bg-muted relative overflow-hidden">
        <Image
          src={data?.images?.[0]?.url}
          alt={data.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover aspect-square rounded-md"
        />
        
        {/* Badges Container - Top Left for NEW, Top Right for Out of Stock */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {/* NEW Badge */}
          {isNewArrival && !isOutOfStock && (
            <div className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </div>
          )}
        </div>
        
        {/* Out of Stock Badge - Top Right */}
        {isOutOfStock && (
          <div className="absolute top-2 right-2 bg-error text-error-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            Out of Stock
          </div>
        )}

        <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5">
          <div className='flex gap-x-6 justify-center'>
             <IconButton 
              onClick={onPreview}
              icon={<Expand size={20} className='text-muted-foreground' />}
             />
             {!isOutOfStock && (
               <IconButton 
                 onClick={onAddToCart}
                 icon={<ShoppingCart size={20} className='text-muted-foreground' />}
               />
             )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className='font-semibold text-lg text-foreground'>
          {data.name}
        </p>
        {data.titlepoints && data.titlepoints.length > 0 && (
          <p className='text-xs text-muted-foreground mt-1 line-clamp-1'>
            {data.titlepoints.join(' | ')}
          </p>
        )}
        {/* Low Stock Warning */}
        {data.stockQuantity <= data.lowStockThreshold && (
          <p className='text-xs text-error font-semibold mt-1 animate-pulse'>
            Only {data.stockQuantity} remaining, Hurry Up!
          </p>
        )}
        <p className='text-sm text-muted-foreground mt-1'>
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
