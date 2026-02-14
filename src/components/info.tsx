"use client"

import { Product, ProductVariant } from '@/types'
import React, { useEffect, useMemo, useState } from 'react'
import PriceDisplay from '@/components/ui/price-display'
import Button from '@/components/ui/button'
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react'
import useCart from '@/hooks/use-cart'
import { WarrantyBadge, SpecificationsTable, SizeSelector } from '@/components/product'
import usePreviewModal from '@/hooks/use-preview-modal'
import { getDisplayPrices } from '@/lib/utils'

interface InfoProps {
    data: Product
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const previewModal = usePreviewModal();
  const cart = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Check if this is a variant product
  const isVariantProduct = data.hasVariants && Array.isArray(data.variants) && data.variants.length > 0;
  
  // Get sorted variants (only for variant products)
  const availableSizes = useMemo(() => 
    isVariantProduct 
      ? [...data.variants].sort((a, b) => a.displayOrder - b.displayOrder)
      : []
  , [isVariantProduct, data.variants]);
  
  // Auto-select first in-stock variant on mount
  useEffect(() => {
    if (isVariantProduct && availableSizes.length > 0 && !selectedVariant) {
      const firstInStockVariant = availableSizes.find(v => v.stockQuantity > 0);
      if (firstInStockVariant) {
        setSelectedVariant(firstInStockVariant);
      }
    }
  }, [isVariantProduct, availableSizes, selectedVariant]);
  
  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant?.id]);
  
  // Get current stock based on product type
  const getCurrentStock = () => {
    if (isVariantProduct) {
      return selectedVariant?.stockQuantity ?? 0;
    }
    return data.baseStockQuantity ?? 0;
  };
  
  const getCurrentThreshold = () => {
    if (isVariantProduct) {
      return selectedVariant?.lowStockThreshold ?? 5;
    }
    return data.baseLowStockThreshold ?? 5;
  };
  
  const currentStock = getCurrentStock();
  const currentThreshold = getCurrentThreshold();
  const isLowStock = currentStock > 0 && currentStock <= currentThreshold;
  
  // Check if product is in stock
  const isInStock = isVariantProduct 
    ? availableSizes.some(v => v.stockQuantity > 0)
    : (data.baseStockQuantity ?? 0) > 0;

  // Get display prices - updates based on selected variant
  const displayPrices = getDisplayPrices(data, selectedVariant);

  const onAddToCart: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    
    if (isVariantProduct) {
      if (!selectedVariant) return; // Button should be disabled anyway
      cart.addItem(data, selectedVariant, quantity);
      previewModal.onClose();
    } else {
      // For non-variant products, create a "default" variant
      const defaultVariant: ProductVariant = {
        id: `${data.id}-default`,
        productId: data.id,
        sizeId: 'default',
        size: { id: 'default', name: 'Default', value: 'Default' },
        stockQuantity: data.baseStockQuantity ?? 0,
        lowStockThreshold: data.baseLowStockThreshold ?? 5,
        sku: data.sku,
        displayOrder: 0,
        // Non-variant products don't have variant-specific pricing
        price: null,
        sellingPrice: null,
      };
      cart.addItem(data, defaultVariant, quantity);
    }
    setQuantity(1); // Reset quantity after adding to cart
  }
  
  // Quantity controls
  const canIncreaseQuantity = quantity < currentStock;
  const canDecreaseQuantity = quantity > 1;
  
  const increaseQuantity = () => {
    if (canIncreaseQuantity) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (canDecreaseQuantity) {
      setQuantity(prev => prev - 1);
    }
  };

  // Function to format description with bold "Ingredients:" if present
  const formatDescription = (description: string) => {
    if (description.includes('Ingredients:')) {
      const parts = description.split('Ingredients:');
      return (
        <>
          {parts[0]}
          <br />
          <strong>Ingredients:</strong>
          {parts[1]}
        </>
      );
    }
    return description;
  };
  
  // Determine if add to cart should be disabled
  const isAddToCartDisabled = isVariantProduct 
    ? (!selectedVariant || selectedVariant.stockQuantity === 0)
    : ((data.baseStockQuantity ?? 0) === 0);

  return (
    <article className="space-y-6">
      {/* Product Title and Meta */}
      <header>
        <h1 className='text-3xl font-bold text-foreground mb-2'>{data.name}</h1>
        
        {/* SKU Display - Show product SKU or selected variant SKU */}
        {(data.sku || selectedVariant?.sku) && (
          <p className='text-sm text-muted-foreground mb-2'>
            Model: <span className='font-mono'>{selectedVariant?.sku || data.sku}</span>
          </p>
        )}

        {/* Short Description / Tagline */}
        {data.shortDescription && (
          <p className='text-base text-muted-foreground mb-3'>
            {data.shortDescription}
          </p>
        )}

        {/* Title Points as tags */}
        {data.titlepoints && data.titlepoints.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {data.titlepoints.map((point, i) => (
              <span 
                key={i} 
                className='bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full'
              >
                {point}
              </span>
            ))}
          </div>
        )}

        {/* Price Display with Discount - Updates based on selected variant */}
        <div className='flex items-end justify-between'>
          <PriceDisplay 
            price={displayPrices.mrp} 
            sellingPrice={displayPrices.hasDiscount ? displayPrices.sellingPrice : null} 
            size="lg"
          />
        </div>
      </header>

      {/* Warranty Badge */}
      <WarrantyBadge warranty={data.warranty} variant="card" />

      <hr className='border-border' />

      {/* SIZE SELECTOR - Only show for variant products */}
      {isVariantProduct && (
        <SizeSelector
          variants={availableSizes}
          selectedVariant={selectedVariant}
          onSelect={setSelectedVariant}
        />
      )}
      
      {/* Stock Status for non-variant products */}
      {!isVariantProduct && (
        <div className="flex items-center gap-2 text-sm">
          {isInStock ? (
            <>
              <span className="text-success font-medium">In Stock</span>
              {isLowStock && (
                <span className="text-warning">
                  (Only {data.baseStockQuantity} left!)
                </span>
              )}
            </>
          ) : (
            <span className="text-error font-medium">Out of Stock</span>
          )}
        </div>
      )}

      {/* Description */}
      {data.description && (
        <section className="space-y-3">
          <h3 className='font-semibold text-foreground text-lg'>Description</h3>
          <p className='text-muted-foreground leading-relaxed text-sm'>
            {formatDescription(data.description)}
          </p>
        </section>
      )}

      {/* Bullet Points */}
      {data.bulletPoints && data.bulletPoints.length > 0 && (
        <section className="space-y-3">
          <h3 className='font-semibold text-foreground text-lg'>Key Features</h3>
          <ul className='space-y-2'>
            {data.bulletPoints.map((point, index) => (
              <li key={index} className='flex items-start gap-3'>
                <div className='flex-shrink-0 w-5 h-5 bg-success/20 rounded-full flex items-center justify-center mt-0.5'>
                  <Check size={12} className='text-success' />
                </div>
                <span className='text-muted-foreground text-sm leading-relaxed'>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Specifications Table */}
      <SpecificationsTable specifications={data.specifications} />

      <hr className='border-border' />

      {/* Quantity Selector and Add to Cart */}
      <section className='pt-4 space-y-4'>
        {!isInStock ? (
          <div className='w-full flex items-center justify-center gap-x-2 bg-muted text-muted-foreground py-3 px-6 rounded-lg font-medium cursor-not-allowed'>
            Out of Stock
          </div>
        ) : (
          <>
            {/* Quantity Selector */}
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-foreground'>Quantity:</span>
              <div className='flex items-center gap-2'>
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={!canDecreaseQuantity || isAddToCartDisabled}
                  className='w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95'
                >
                  <Minus size={16} />
                </button>
                <span className='w-12 text-center text-lg font-semibold text-foreground'>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={!canIncreaseQuantity || isAddToCartDisabled}
                  className='w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95'
                  title={!canIncreaseQuantity ? `Maximum stock available: ${currentStock}` : ''}
                >
                  <Plus size={16} />
                </button>
              </div>
              {/* Low stock warning */}
              {isLowStock && (
                <span className='text-sm text-warning font-medium'>
                  Only {currentStock} left!
                </span>
              )}
            </div>
            
            {/* Add to Cart Button */}
            <Button 
              onClick={onAddToCart}
              disabled={isAddToCartDisabled}
              className='w-full flex items-center justify-center gap-x-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isVariantProduct && !selectedVariant ? 'Select a Size' : `Add ${quantity > 1 ? `${quantity} Items` : ''} to Cart`}
              <ShoppingCart size={18} />
            </Button>
          </>
        )}
      </section>
    </article>
  )
}

export default Info;