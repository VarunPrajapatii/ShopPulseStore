import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/types';

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
 * Custom hook for filtering products by price range
 * Calculates min/max from products and provides filtering logic
 * 
 * @param products - Array of products to filter
 * @returns Filtered products and filter controls
 */
export const usePriceFilter = (products: Product[]) => {
  /**
   * Calculate the price range from all products
   * Memoized to prevent recalculation on every render
   */
  const priceRange = useMemo(() => {
    if (products.length === 0) {
      return { min: 0, max: 10000 };
    }

    const prices = products.map(p => parseFloat(p.price));
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
   */
  const filteredProducts = useMemo(() => {
    const [minPrice, maxPrice] = selectedRange;
    
    return products.filter(product => {
      const price = parseFloat(product.price);
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
