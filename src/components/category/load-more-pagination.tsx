'use client';

import { Loader2 } from 'lucide-react';

interface LoadMorePaginationProps {
  /** Number of items currently showing */
  currentCount: number;
  /** Total number of items */
  totalItems: number;
  /** Progress percentage (0-100) */
  progressPercent: number;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Number of remaining items */
  remainingItems: number;
  /** Load more callback */
  onLoadMore: () => void;
  /** Optional loading state */
  isLoading?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Load More Pagination Component
 * 
 * Displays a "Load More" button with progress indicator.
 * Shows current position in the list and remaining items.
 * Includes visual progress bar for better UX.
 * 
 * @example
 * <LoadMorePagination
 *   currentCount={24}
 *   totalItems={156}
 *   progressPercent={15}
 *   hasMore={true}
 *   remainingItems={132}
 *   onLoadMore={loadMore}
 * />
 */
const LoadMorePagination = ({
  currentCount,
  totalItems,
  progressPercent,
  hasMore,
  remainingItems,
  onLoadMore,
  isLoading = false,
  className = '',
}: LoadMorePaginationProps) => {
  // Don't render if no items or all items shown
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center gap-4 py-8 ${className}`}>
      {/* Status text */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{currentCount}</span> of{' '}
        <span className="font-medium text-foreground">{totalItems}</span> products
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Load More button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="
            inline-flex items-center justify-center gap-2
            px-8 py-3
            text-sm font-semibold
            bg-foreground text-background
            rounded-full
            hover:bg-foreground/90
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            min-w-[200px]
          "
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>Load More</span>
              <span className="text-xs opacity-70">
                ({remainingItems} remaining)
              </span>
            </>
          )}
        </button>
      )}

      {/* All items loaded message */}
      {!hasMore && totalItems > 0 && (
        <p className="text-sm text-muted-foreground">
          You&apos;ve viewed all products in this category
        </p>
      )}
    </div>
  );
};

export default LoadMorePagination;
