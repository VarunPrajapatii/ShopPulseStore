'use client';

import { ChevronDown } from 'lucide-react';
import { SortOption, SORT_OPTIONS } from '@/hooks/use-sorting';

interface SortDropdownProps {
  /** Currently selected sort option */
  value: SortOption;
  /** Callback when sort option changes */
  onChange: (value: SortOption) => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * Sort Dropdown Component
 * 
 * Provides a styled dropdown for selecting sort order.
 * Displays all available sort options with clear labels.
 * 
 * @example
 * <SortDropdown
 *   value={sortBy}
 *   onChange={setSortBy}
 * />
 */
const SortDropdown = ({ value, onChange, className = '' }: SortDropdownProps) => {
  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* Label - hidden on mobile for space */}
      <label 
        htmlFor="sort-select" 
        className="hidden sm:block text-sm font-medium text-muted-foreground whitespace-nowrap"
      >
        Sort by:
      </label>
      
      {/* Custom styled select */}
      <div className="relative">
        <select
          id="sort-select"
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="
            appearance-none
            bg-background
            border border-border
            rounded-lg
            py-2 pl-3 pr-9
            text-sm font-medium
            text-foreground
            cursor-pointer
            transition-all duration-200
            hover:border-primary/50
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            min-w-[140px] sm:min-w-[160px]
          "
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown icon */}
        <ChevronDown 
          className="
            absolute right-2.5 top-1/2 -translate-y-1/2
            h-4 w-4 text-muted-foreground
            pointer-events-none
          " 
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default SortDropdown;
