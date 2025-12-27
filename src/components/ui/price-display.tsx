'use client';

import { useEffect, useState } from 'react';
import { formatter } from '@/components/ui/currency';

interface PriceDisplayProps {
  /** Original/MRP price */
  price: string | number;
  /** Discounted/sale price (null if no discount) */
  sellingPrice?: number | null;
  /** Size variant - 'sm' for cards, 'lg' for product page */
  size?: 'sm' | 'lg';
  /** Optional className for styling */
  className?: string;
}

/**
 * Calculate discount percentage
 * Returns null if no valid discount
 */
const calculateDiscountPercentage = (
  price: number, 
  sellingPrice: number | null | undefined
): number | null => {
  if (!sellingPrice || sellingPrice <= 0 || sellingPrice >= price) {
    return null;
  }
  return Math.round(((price - sellingPrice) / price) * 100);
};

/**
 * Price Display Component
 * 
 * Shows price with optional discount display:
 * - If sellingPrice exists and is less than price: shows strikethrough original + sale price + discount badge
 * - If no sellingPrice: shows regular price
 * 
 * @example
 * // Regular price
 * <PriceDisplay price={1999} />
 * 
 * // With discount
 * <PriceDisplay price={1999} sellingPrice={1499} />
 */
const PriceDisplay: React.FC<PriceDisplayProps> = ({ 
  price, 
  sellingPrice, 
  size = 'lg',
  className = '' 
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const numericPrice = Number(price);
  const hasDiscount = sellingPrice !== null && 
                      sellingPrice !== undefined && 
                      sellingPrice > 0 && 
                      sellingPrice < numericPrice;
  const discountPercent = calculateDiscountPercentage(numericPrice, sellingPrice);

  // Size-based styles
  const styles = {
    sm: {
      container: 'flex items-center gap-1.5 flex-wrap',
      salePrice: 'text-base font-bold text-success',
      originalPrice: 'text-xs text-muted-foreground line-through',
      regularPrice: 'text-base font-bold text-foreground',
      badge: 'text-[10px] font-semibold bg-success/10 text-success px-1.5 py-0.5 rounded',
    },
    lg: {
      container: 'flex items-center gap-2 flex-wrap',
      salePrice: 'text-2xl font-bold text-success',
      originalPrice: 'text-lg text-muted-foreground line-through',
      regularPrice: 'text-2xl font-bold text-foreground',
      badge: 'text-sm font-semibold bg-success/10 text-success px-2 py-0.5 rounded-md',
    },
  };

  const s = styles[size];

  return (
    <div className={`${s.container} ${className}`}>
      {hasDiscount ? (
        <>
          {/* Current selling price */}
          <span className={s.salePrice}>
            {formatter.format(sellingPrice!)}
          </span>
          
          {/* Original price with strikethrough */}
          <span className={s.originalPrice}>
            {formatter.format(numericPrice)}
          </span>
          
          {/* Discount badge */}
          {discountPercent && (
            <span className={s.badge}>
              {discountPercent}% OFF
            </span>
          )}
        </>
      ) : (
        <span className={s.regularPrice}>
          {formatter.format(numericPrice)}
        </span>
      )}
    </div>
  );
};

export default PriceDisplay;
