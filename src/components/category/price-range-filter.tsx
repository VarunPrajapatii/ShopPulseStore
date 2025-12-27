'use client';

import { useCallback, useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';

interface PriceRangeFilterProps {
  /** Minimum price available */
  minPrice: number;
  /** Maximum price available */
  maxPrice: number;
  /** Currently selected range [min, max] */
  selectedRange: [number, number];
  /** Callback when range changes */
  onRangeChange: (range: [number, number]) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Format price for display with Indian Rupee symbol
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
 * Price Range Filter Component
 * 
 * Provides a dual-thumb slider for filtering products by price.
 * Includes min/max input fields for precise selection.
 * Debounces slider changes to prevent excessive re-renders.
 * 
 * @example
 * <PriceRangeFilter
 *   minPrice={0}
 *   maxPrice={10000}
 *   selectedRange={[500, 5000]}
 *   onRangeChange={setPriceRange}
 * />
 */
const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  selectedRange,
  onRangeChange,
  className = '',
}: PriceRangeFilterProps) => {
  // Local state for immediate UI feedback
  const [localRange, setLocalRange] = useState<[number, number]>(selectedRange);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalRange(selectedRange);
  }, [selectedRange]);

  /**
   * Handle slider value change
   * Updates local state immediately, debounces parent callback
   */
  const handleSliderChange = useCallback((values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setLocalRange(newRange);
  }, []);

  /**
   * Commit changes to parent when slider interaction ends
   */
  const handleSliderCommit = useCallback((values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    onRangeChange(newRange);
  }, [onRangeChange]);

  /**
   * Handle min input change
   */
  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || minPrice;
    const clampedValue = Math.max(minPrice, Math.min(value, localRange[1] - 1));
    const newRange: [number, number] = [clampedValue, localRange[1]];
    setLocalRange(newRange);
    onRangeChange(newRange);
  }, [minPrice, localRange, onRangeChange]);

  /**
   * Handle max input change
   */
  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || maxPrice;
    const clampedValue = Math.min(maxPrice, Math.max(value, localRange[0] + 1));
    const newRange: [number, number] = [localRange[0], clampedValue];
    setLocalRange(newRange);
    onRangeChange(newRange);
  }, [maxPrice, localRange, onRangeChange]);

  // Don't render if price range is invalid
  if (maxPrice <= minPrice) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Price Range</span>
      </div>

      {/* Slider */}
      <div className="px-1">
        <Slider
          value={localRange}
          min={minPrice}
          max={maxPrice}
          step={Math.max(1, Math.floor((maxPrice - minPrice) / 100))}
          onValueChange={handleSliderChange}
          onValueCommit={handleSliderCommit}
          className="w-full"
        />
      </div>

      {/* Price inputs */}
      <div className="flex items-center gap-3">
        {/* Min price input */}
        <div className="flex-1">
          <label htmlFor="min-price" className="sr-only">
            Minimum price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ₹
            </span>
            <input
              id="min-price"
              type="number"
              min={minPrice}
              max={localRange[1] - 1}
              value={localRange[0]}
              onChange={handleMinChange}
              className="
                w-full pl-7 pr-3 py-2
                text-sm
                border border-border rounded-lg
                bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              "
              placeholder="Min"
            />
          </div>
        </div>

        {/* Separator */}
        <span className="text-muted-foreground">—</span>

        {/* Max price input */}
        <div className="flex-1">
          <label htmlFor="max-price" className="sr-only">
            Maximum price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ₹
            </span>
            <input
              id="max-price"
              type="number"
              min={localRange[0] + 1}
              max={maxPrice}
              value={localRange[1]}
              onChange={handleMaxChange}
              className="
                w-full pl-7 pr-3 py-2
                text-sm
                border border-border rounded-lg
                bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              "
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Price range display */}
      <p className="text-xs text-muted-foreground text-center">
        {formatPrice(localRange[0])} — {formatPrice(localRange[1])}
      </p>
    </div>
  );
};

export default PriceRangeFilter;
