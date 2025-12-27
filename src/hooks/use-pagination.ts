import { useState, useMemo, useCallback } from 'react';

/**
 * Configuration for pagination
 */
export interface PaginationConfig {
  /** Number of items to show per page/load */
  itemsPerPage?: number;
}

/**
 * Custom hook for load-more style pagination
 * Efficiently manages visible items without re-filtering the entire array
 * 
 * @param items - Array of items to paginate
 * @param config - Pagination configuration
 * @returns Paginated items and pagination controls
 */
export const usePagination = <T>(
  items: T[],
  config: PaginationConfig = {}
) => {
  const { itemsPerPage = 24 } = config;
  
  // Track how many items to show (starts with first page)
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  /**
   * Get the currently visible items
   * Uses slice for O(n) performance where n = visibleCount
   */
  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  /**
   * Total number of items available
   */
  const totalItems = items.length;

  /**
   * Number of items currently showing
   */
  const currentCount = Math.min(visibleCount, totalItems);

  /**
   * Check if there are more items to load
   */
  const hasMore = visibleCount < totalItems;

  /**
   * Number of remaining items to load
   */
  const remainingItems = Math.max(0, totalItems - visibleCount);

  /**
   * Progress percentage (0-100)
   */
  const progressPercent = totalItems > 0 
    ? Math.round((currentCount / totalItems) * 100) 
    : 100;

  /**
   * Load more items
   * Adds another page worth of items to the visible set
   */
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + itemsPerPage, totalItems));
  }, [itemsPerPage, totalItems]);

  /**
   * Reset pagination to initial state
   * Useful when filters change
   */
  const reset = useCallback(() => {
    setVisibleCount(itemsPerPage);
  }, [itemsPerPage]);

  /**
   * Show all items at once
   */
  const showAll = useCallback(() => {
    setVisibleCount(totalItems);
  }, [totalItems]);

  return {
    // Data
    visibleItems,
    totalItems,
    currentCount,
    remainingItems,
    progressPercent,
    
    // State
    hasMore,
    
    // Actions
    loadMore,
    reset,
    showAll,
    
    // Config
    itemsPerPage,
  };
};

export default usePagination;
