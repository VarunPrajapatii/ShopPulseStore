'use client';

import { useCallback, useEffect } from 'react';
import { Product, Category } from '@/types';

// Hooks
import useSorting from '@/hooks/use-sorting';
import usePagination from '@/hooks/use-pagination';
import usePriceFilter from '@/hooks/use-price-filter';

// Components
import SortDropdown from '@/components/category/sort-dropdown';
import PriceRangeFilter from '@/components/category/price-range-filter';
import ActiveFilters from '@/components/category/active-filters';
import LoadMorePagination from '@/components/category/load-more-pagination';
import CategorySEOContent from '@/components/category/category-seo-content';
import ProductCard from '@/components/ui/product-card';
import NoResults from '@/components/ui/no-results';

interface CategoryProductsEnhancedProps {
  /** Array of products in this category */
  products: Product[];
  /** Category information for SEO content */
  category: Category;
}

/**
 * Enhanced Category Products Component
 * 
 * Main client component that integrates:
 * - Sorting (name, price, date - asc/desc)
 * - Price range filtering
 * - Load more pagination (24 items per page)
 * - Active filters display
 * - SEO content section
 * 
 * All filtering, sorting, and pagination happens client-side
 * for instant UX without additional API calls.
 */
const CategoryProductsEnhanced = ({ 
  products, 
  category 
}: CategoryProductsEnhancedProps) => {
  // ============================================
  // HOOKS - Order matters for data flow
  // ============================================
  
  // 1. Price filtering (first filter)
  const {
    minPrice,
    maxPrice,
    selectedRange,
    filteredProducts: priceFilteredProducts,
    isFilterActive: isPriceFilterActive,
    setPriceRange,
    resetFilter: resetPriceFilter,
  } = usePriceFilter(products);

  // 2. Sorting (applied to price-filtered products)
  const {
    sortBy,
    setSortBy,
    sortedProducts,
    resetSort,
    isSortActive,
  } = useSorting(priceFilteredProducts);

  // 3. Pagination (applied to sorted products)
  const {
    visibleItems,
    totalItems,
    currentCount,
    remainingItems,
    progressPercent,
    hasMore,
    loadMore,
    reset: resetPagination,
  } = usePagination(sortedProducts, { itemsPerPage: 24 });

  // ============================================
  // EFFECTS
  // ============================================

  /**
   * Reset pagination when filters or sorting change
   * This ensures users always start from page 1 after filter changes
   */
  useEffect(() => {
    resetPagination();
  }, [sortBy, selectedRange, resetPagination]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Clear all filters and sorting
   */
  const handleClearAll = useCallback(() => {
    resetSort();
    resetPriceFilter();
    resetPagination();
  }, [resetSort, resetPriceFilter, resetPagination]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Check if any filters are active
  const hasActiveFilters = isSortActive || isPriceFilterActive;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      {/* ----------------------------------------
          FILTER & SORT BAR
          ---------------------------------------- */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left side: Product count + Price filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Product count */}
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            <span className="font-medium text-foreground">{totalItems}</span>
            {' '}{totalItems === 1 ? 'product' : 'products'} found
          </p>

          {/* Price range filter - collapsible on mobile */}
          <div className="w-full sm:w-auto sm:min-w-[280px] p-4 bg-muted/30 rounded-xl border border-border/50">
            <PriceRangeFilter
              minPrice={minPrice}
              maxPrice={maxPrice}
              selectedRange={selectedRange}
              onRangeChange={setPriceRange}
            />
          </div>
        </div>

        {/* Right side: Sort dropdown */}
        <div className="flex items-center">
          <SortDropdown
            value={sortBy}
            onChange={setSortBy}
          />
        </div>
      </div>

      {/* ----------------------------------------
          ACTIVE FILTERS DISPLAY
          ---------------------------------------- */}
      {hasActiveFilters && (
        <ActiveFilters
          isSortActive={isSortActive}
          sortBy={sortBy}
          onResetSort={resetSort}
          isPriceFilterActive={isPriceFilterActive}
          priceRange={selectedRange}
          onResetPriceFilter={resetPriceFilter}
          onClearAll={handleClearAll}
          className="py-2"
        />
      )}

      {/* ----------------------------------------
          PRODUCTS GRID
          ---------------------------------------- */}
      {visibleItems.length === 0 ? (
        <NoResults />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {visibleItems.map((product) => (
            <ProductCard 
              key={product.id} 
              data={product} 
            />
          ))}
        </div>
      )}

      {/* ----------------------------------------
          LOAD MORE PAGINATION
          ---------------------------------------- */}
      <LoadMorePagination
        currentCount={currentCount}
        totalItems={totalItems}
        progressPercent={progressPercent}
        hasMore={hasMore}
        remainingItems={remainingItems}
        onLoadMore={loadMore}
      />

      {/* ----------------------------------------
          CATEGORY SEO CONTENT
          ---------------------------------------- */}
      <CategorySEOContent
        categoryName={category.name}
        // description is passed from category if available
      />
    </div>
  );
};

export default CategoryProductsEnhanced;
