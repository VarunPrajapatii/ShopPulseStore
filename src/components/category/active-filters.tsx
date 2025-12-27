'use client';

import { X } from 'lucide-react';
import { SortOption, SORT_OPTIONS } from '@/hooks/use-sorting';

/**
 * Active filter item interface
 */
interface ActiveFilter {
  /** Unique identifier for the filter */
  id: string;
  /** Display label for the filter */
  label: string;
  /** Type of filter (for styling/grouping) */
  type: 'sort' | 'price';
  /** Callback to remove this filter */
  onRemove: () => void;
}

interface ActiveFiltersProps {
  /** Whether sorting is active (not default) */
  isSortActive: boolean;
  /** Current sort option */
  sortBy: SortOption;
  /** Reset sort callback */
  onResetSort: () => void;
  /** Whether price filter is active */
  isPriceFilterActive: boolean;
  /** Current price range for display */
  priceRange: [number, number];
  /** Reset price filter callback */
  onResetPriceFilter: () => void;
  /** Clear all filters callback */
  onClearAll: () => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Format price for display
 */
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Active Filters Display Component
 * 
 * Shows currently active filters as removable chips/tags.
 * Provides individual removal and "Clear All" functionality.
 * Only renders when at least one filter is active.
 * 
 * @example
 * <ActiveFilters
 *   isSortActive={true}
 *   sortBy="price-asc"
 *   onResetSort={resetSort}
 *   isPriceFilterActive={true}
 *   priceRange={[500, 5000]}
 *   onResetPriceFilter={resetPriceFilter}
 *   onClearAll={handleClearAll}
 * />
 */
const ActiveFilters = ({
  isSortActive,
  sortBy,
  onResetSort,
  isPriceFilterActive,
  priceRange,
  onResetPriceFilter,
  onClearAll,
  className = '',
}: ActiveFiltersProps) => {
  // Build list of active filters
  const activeFilters: ActiveFilter[] = [];

  // Add sort filter if active
  if (isSortActive) {
    const sortLabel = SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || sortBy;
    activeFilters.push({
      id: 'sort',
      label: `Sort: ${sortLabel}`,
      type: 'sort',
      onRemove: onResetSort,
    });
  }

  // Add price filter if active
  if (isPriceFilterActive) {
    activeFilters.push({
      id: 'price',
      label: `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`,
      type: 'price',
      onRemove: onResetPriceFilter,
    });
  }

  // Don't render if no filters are active
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Label */}
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {activeFilters.map((filter) => (
          <button
            key={filter.id}
            onClick={filter.onRemove}
            className="
              inline-flex items-center gap-1.5
              px-3 py-1.5
              text-sm font-medium
              bg-primary/10 text-primary
              rounded-full
              hover:bg-primary/20
              transition-colors duration-200
              group
            "
            aria-label={`Remove ${filter.label} filter`}
          >
            <span>{filter.label}</span>
            <X 
              className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" 
              aria-hidden="true"
            />
          </button>
        ))}

        {/* Clear All button (only show if multiple filters) */}
        {activeFilters.length > 1 && (
          <button
            onClick={onClearAll}
            className="
              text-sm font-medium
              text-muted-foreground hover:text-foreground
              underline underline-offset-4
              transition-colors duration-200
            "
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveFilters;
