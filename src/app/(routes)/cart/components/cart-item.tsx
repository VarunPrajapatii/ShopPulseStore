'use client';

import PriceDisplay from '@/components/ui/price-display';
import IconButton from '@/components/ui/icon-button';
import useCart from '@/hooks/use-cart';
import { Product, ProductVariant } from '@/types';
import { X, Plus, Minus, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { getDisplayPrices } from '@/lib/utils';

// Cart item includes variant info and effective price
interface CartItemData extends Product {
  variantId: string;
  selectedVariant: ProductVariant;
  effectivePrice?: number;  // Price calculated at time of adding to cart
}

interface CartItemProps {
  data: CartItemData;
  quantity: number;
}

const CartItem: React.FC<CartItemProps> = ({ data, quantity }) => {
  const cart = useCart();
  
  const currentStock = data.selectedVariant.stockQuantity;
  const lowStockThreshold = data.selectedVariant.lowStockThreshold;
  
  // Get display prices for this variant
  const displayPrices = getDisplayPrices(data, data.selectedVariant);

  const onRemove = () => {
    cart.removeItem(data.id, data.variantId);
  };

  const onIncrease = () => {
    if (quantity < currentStock) {
      cart.increaseQuantity(data.id, data.variantId);
    }
  };

  const onDecrease = () => {
    cart.decreaseQuantity(data.id, data.variantId);
  };

  const hasStockIssue = quantity > currentStock;
  const canIncrease = quantity < currentStock;
  const isLowStock = currentStock > 0 && currentStock <= lowStockThreshold;

  return (
    <li className={`flex py-6 border-b border-border transition-colors duration-200 ${hasStockIssue ? 'bg-error/5 border-error/20' : ''}`}>
      <div className="relative h-24 w-24 rounded-md overflow-hidden sm:h-48 sm:w-48 group">
        <Image
          fill
          src={data?.images?.[0]?.url}
          alt="Product Image"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
        <div className="absolute z-10 right-0 top-0">
          <IconButton onClick={onRemove} icon={<X size={15} />} />
        </div>
        <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
          <div className="flex justify-between">
            <p className="text-lg font-bold text-foreground">{data.name}</p>
          </div>

          {/* Size Display - only show for variant products (not "Default") */}
          {data.selectedVariant.size.name !== 'Default' && (
            <div className="mt-1 flex text-sm">
              <p className="text-muted-foreground">
                Size: <span className="font-medium text-foreground">{data.selectedVariant.size.name}</span>
              </p>
            </div>
          )}
          
          {/* SKU Display */}
          {data.selectedVariant.sku && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              SKU: <span className="font-mono">{data.selectedVariant.sku}</span>
            </div>
          )}
          
          {/* Price - Using variant-specific pricing */}
          <div className="mt-2">
            <PriceDisplay 
              price={displayPrices.mrp} 
              sellingPrice={displayPrices.hasDiscount ? displayPrices.sellingPrice : null} 
              size="sm"
            />
          </div>
        </div>

        {/* Stock Warning */}
        {hasStockIssue && (
          <div className="flex items-center gap-2 mt-2 text-error text-sm animate-fade-in">
            <AlertCircle size={16} className="animate-pulse" />
            <span className="font-semibold">
              Only {currentStock} available{data.selectedVariant.size.name !== 'Default' ? ' in this size' : ''}! Please reduce quantity.
            </span>
          </div>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center space-x-3 mt-4">
          <span className="text-sm text-muted-foreground font-medium">Quantity:</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onDecrease}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-semibold text-foreground">
              {data.quantity}
            </span>
            <button
              onClick={onIncrease}
              disabled={!canIncrease}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-110 active:scale-95"
              title={!canIncrease ? `Maximum stock available: ${currentStock}` : ''}
            >
              <Plus size={14} />
            </button>
          </div>
          {/* Only show stock count if low stock (at or below threshold) */}
          {isLowStock && !hasStockIssue && (
            <span className="text-xs text-warning font-medium">
              Only {currentStock} left!
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default CartItem;