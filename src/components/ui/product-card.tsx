'use client';

import { Product } from '@/types';
import Image from 'next/image';
import IconButton from '@/components/ui/icon-button';
import { Expand, ShoppingCart, Sparkles } from 'lucide-react';
import PriceDisplay from '@/components/ui/price-display';
import { useRouter } from 'next/navigation';
import usePreviewModal from '@/hooks/use-preview-modal';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  data: Product;
  isNewArrival?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ data, isNewArrival = false }) => {
  const previewModal = usePreviewModal();
  const router = useRouter();
  
  // Check if this is a variant product
  const isVariantProduct = data.hasVariants && Array.isArray(data.variants) && data.variants.length > 0;
  
  // Get sorted variants for display (only for variant products)
  const sortedVariants = isVariantProduct
    ? [...data.variants].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  
  // Calculate total stock based on product type
  const totalStock = isVariantProduct 
    ? sortedVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
    : (data.baseStockQuantity ?? 0);
  const isOutOfStock = totalStock === 0;
  
  // Count available sizes (only for variant products)
  const availableSizesCount = sortedVariants.filter(v => v.stockQuantity > 0).length;
  
  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  }

  const onPreview: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    previewModal.onOpen(data);
  }

  const onAddToCart: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    // Redirect to product page to select size
    router.push(`/product/${data?.id}`);
  }

  // Check if product has a valid discount
  const hasDiscount = data.sellingPrice && 
                      data.sellingPrice > 0 && 
                      data.sellingPrice < Number(data.price);

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
        
        {/* Badges Container - Top Left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {/* NEW Badge */}
          {isNewArrival && !isOutOfStock && (
            <div className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              NEW
            </div>
          )}
          {/* SALE Badge */}
          {hasDiscount && !isOutOfStock && (
            <div className="bg-success text-success-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
              SALE
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
        <p className='font-semibold text-lg text-foreground line-clamp-1'>
          {data.name}
        </p>
        
        {/* Size Preview - only for variant products */}
        {isVariantProduct && sortedVariants.length > 0 && (
          <div className='flex flex-wrap gap-1 mt-2'>
            {sortedVariants.slice(0, 5).map((variant) => (
              <span 
                key={variant.id}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded border",
                  variant.stockQuantity > 0 
                    ? "border-border text-muted-foreground" 
                    : "border-border/50 text-muted-foreground/50 line-through"
                )}
              >
                {variant.size.name}
              </span>
            ))}
            {sortedVariants.length > 5 && (
              <span className="text-[10px] text-muted-foreground">
                +{sortedVariants.length - 5}
              </span>
            )}
          </div>
        )}
        
        {/* Size availability info - only for variant products */}
        {isVariantProduct && !isOutOfStock && (
          <p className='text-xs text-muted-foreground mt-1'>
            {availableSizesCount} of {sortedVariants.length} sizes available
          </p>
        )}
        
        {/* Stock info for non-variant products */}
        {!isVariantProduct && !isOutOfStock && (
          <p className='text-xs text-muted-foreground mt-1'>
            In Stock
          </p>
        )}
        
        <p className='text-sm text-muted-foreground mt-1'>
          {data.category?.name}
        </p>
      </div>

      {/* Price - Using new PriceDisplay component */}
      <div className='flex items-center justify-between'>
        <PriceDisplay 
          price={data.price} 
          sellingPrice={data.sellingPrice} 
          size="sm"
        />
      </div>
    </div>
  );
};

export default ProductCard;