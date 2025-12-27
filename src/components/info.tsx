"use client"

import { Product } from '@/types'
import React, { useEffect } from 'react'
import PriceDisplay from '@/components/ui/price-display'
import Button from '@/components/ui/button'
import { ShoppingCart, Check, AlertCircle } from 'lucide-react'
import useCart from '@/hooks/use-cart'
import sendStockAlert from '@/actions/send-stock-alert'
import { WarrantyBadge, SpecificationsTable } from '@/components/product'

interface InfoProps {
    data: Product
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const cart = useCart();

  // Send stock alert when product is low on stock
  useEffect(() => {
    if (data.stockQuantity <= data.lowStockThreshold) {
      sendStockAlert(data.id);
    }
  }, [data.id, data.stockQuantity, data.lowStockThreshold]);

  const onAddToCart: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    cart.addItem(data);
  }

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

  return (
    <article className="space-y-6">
      {/* Product Title and Meta */}
      <header>
        <h1 className='text-3xl font-bold text-foreground mb-2'>{data.name}</h1>
        
        {/* SKU Display */}
        {data.sku && (
          <p className='text-sm text-muted-foreground mb-2'>
            Model: <span className='font-mono'>{data.sku}</span>
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

        {/* Low Stock Warning */}
        {data.stockQuantity > 0 && data.stockQuantity <= data.lowStockThreshold && (
          <div className='bg-error/10 border border-error/20 rounded-lg p-3 mb-4 flex items-center gap-2'>
            <AlertCircle className='h-5 w-5 text-error flex-shrink-0' />
            <p className='text-sm text-error font-semibold'>
              Only {data.stockQuantity} remaining, Hurry Up!
            </p>
          </div>
        )}

        {/* Price Display with Discount */}
        <div className='flex items-end justify-between'>
          <PriceDisplay 
            price={data.price} 
            sellingPrice={data.sellingPrice} 
            size="lg"
          />
        </div>
      </header>

      {/* Warranty Badge */}
      <WarrantyBadge warranty={data.warranty} variant="card" />

      <hr className='border-border' />

      {/* Size */}
      <div className='flex items-center gap-x-4'>
        <h3 className='font-semibold text-foreground'>Size:</h3>
        <div className='px-3 py-1 bg-muted rounded-md text-sm font-medium text-foreground'>
            {data?.size?.name}
        </div>
      </div>

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

      {/* Add to Cart Button */}
      <section className='pt-4'>
        {data.stockQuantity === 0 ? (
          <div className='w-full flex items-center justify-center gap-x-2 bg-muted text-muted-foreground py-3 px-6 rounded-lg font-medium cursor-not-allowed'>
            Out of Stock
          </div>
        ) : (
          <Button 
            onClick={onAddToCart} 
            className='w-full flex items-center justify-center gap-x-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors'
          >
            Add to Cart
            <ShoppingCart size={18} />
          </Button>
        )}
      </section>
    </article>
  )
}

export default Info;