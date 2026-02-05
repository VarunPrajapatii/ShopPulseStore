import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/types';
import { getVariantPriceRange } from '@/lib/utils';

/**
 * Configuration for price range filter
 */
export interface PriceRangeConfig {
  /** Minimum price in the range */
  min: number;
  /** Maximum price in the range */
  max: number;
}

/**
 * Get effective selling price for a product (for filtering)
 * Uses variant price range minimum or product selling price or MRP
 */
const getProductSellingPrice = (product: Product): number => {
  // For variant products, use the minimum variant price
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    const priceRange = getVariantPriceRange(product);
    return priceRange.minPrice;
  }
  // For non-variant products, use selling price or fall back to MRP
  return product.sellingPrice ?? parseFloat(product.price);
};

/**
 * Custom hook for filtering products by price range
 * Calculates min/max from products and provides filtering logic
 * Uses SELLING PRICE (not MRP) for filtering
 * 
 * @param products - Array of products to filter
 * @returns Filtered products and filter controls
 */
export const usePriceFilter = (products: Product[]) => {
  /**
   * Calculate the price range from all products
   * Uses selling price for accurate filtering
   * Memoized to prevent recalculation on every render
   */
  const priceRange = useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 10000 };
    }

    const prices = products.map(p => getProductSellingPrice(p));
    const min = Math.floor(Math.min(...prices));
    const max = Math.ceil(Math.max(...prices));

    return { min, max };
  }, [products]);

  // Selected price range (starts with full range)
  const [selectedRange, setSelectedRange] = useState<[number, number]>([
    priceRange.min,
    priceRange.max,
  ]);

  /**
   * Update selected range when price range changes
   * This handles cases where products change and range needs to reset
   */
  useMemo(() => {
    setSelectedRange([priceRange.min, priceRange.max]);
  }, [priceRange.min, priceRange.max]);

  /**
   * Filter products by selected price range
   * Uses selling price for filtering
   */
  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = selectedRange;
    
    return products.filter(product => {
      const price = getProductSellingPrice(product);
      return price >= minPrice && price <= maxPrice;
    });
  }, [products, selectedRange]);

  /**
   * Check if filter is active (not at default range)
   */
  const isFilterActive = useMemo(() => {
    return (
      selectedRange[0] !== priceRange.min || 
      selectedRange[1] !== priceRange.max
    );
  }, [selectedRange, priceRange]);

  /**
   * Reset filter to full range
   */
  const resetFilter = useCallback(() => {
    setSelectedRange([priceRange.min, priceRange.max]);
  }, [priceRange]);

  /**
   * Update price range
   */
  const setPriceRange = useCallback((range: [number, number]) => {
    setSelectedRange(range);
  }, []);

  return {
    // Range info
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    selectedRange,
    
    // Data
    filteredProducts,
    
    // State
    isFilterActive,
    
    // Actions
    setPriceRange,
    resetFilter,
  };
};

export default usePriceFilter;
