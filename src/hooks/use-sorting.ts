import { useState, useMemo, useCallback } from 'react';
import { Product } from '@/types';

/**
 * Sort options for products
 * Each option has a value for internal use and label for display
 */
export type SortOption = 
  | 'default'
  | 'name-asc'
  | 'name-desc'
  | 'price-asc'
  | 'price-desc'
  | 'date-asc'
  | 'date-desc';

export interface SortConfig {
  value: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  { value: 'default', label: 'Featured' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'date-desc', label: 'Newest First' },
];

/**
 * Custom hook for sorting products
 * Provides memoized sorting logic with efficient re-renders
 * 
 * @param products - Array of products to sort
 * @returns Sorted products and sort controls
 */
export const useSorting = (products: Product[]) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');

  /**
   * Sort products based on selected option
   * Uses memoization to prevent unnecessary re-calculations
   */
  const sortedProducts = useMemo(() => {
    // Create a shallow copy to avoid mutating the original array
    const sorted = [...products];

    switch (sortBy) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      
      case 'price-asc':
        return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      
      case 'price-desc':
        return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      
      case 'date-asc':
        // Oldest first
        return sorted.sort((a, b) => {
          const dateA = a.createdAt;
          const dateB = b.createdAt;
          // If no dates available, maintain original order
          if (!dateA || !dateB) return 0;
          return new Date(dateA).getTime() - new Date(dateB).getTime();
        });
      
      case 'date-desc':
        // Newest first
        return sorted.sort((a, b) => {
          const dateA = a.createdAt;
          const dateB = b.createdAt;
          // If no dates available, maintain original order
          if (!dateA || !dateB) return 0;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
      
      case 'default':
      default:
        // Keep original order (featured/default)
        return sorted;
    }
  }, [products, sortBy]);

  /**
   * Reset sort to default
   */
  const resetSort = useCallback(() => {
    setSortBy('default');
  }, []);

  /**
   * Check if sorting is active (not default)
   */
  const isSortActive = sortBy !== 'default';

  return {
    sortBy,
    setSortBy,
    sortedProducts,
    resetSort,
    isSortActive,
    sortOptions: SORT_OPTIONS,
  };
};

export default useSorting;
