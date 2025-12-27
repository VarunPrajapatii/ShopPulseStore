'use client';

import { ShieldCheck } from 'lucide-react';

interface WarrantyBadgeProps {
  /** Warranty text from product */
  warranty: string | null | undefined;
  /** Display variant */
  variant?: 'inline' | 'card';
  /** Optional className for styling */
  className?: string;
}

/**
 * Warranty Badge Component
 * 
 * Displays warranty information with a shield icon.
 * Returns null if no warranty or if warranty is "No Warranty".
 * 
 * @example
 * <WarrantyBadge warranty="1 Year Manufacturer Warranty" />
 */
const WarrantyBadge: React.FC<WarrantyBadgeProps> = ({ 
  warranty,
  variant = 'inline',
  className = '' 
}) => {
  // Don't render if no warranty or "No Warranty"
  if (!warranty || warranty === 'No Warranty' || warranty.trim() === '') {
    return null;
  }

  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-info/10 border border-info/20 rounded-xl ${className}`}>
        <div className="flex-shrink-0 w-10 h-10 bg-info/20 rounded-full flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-info" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{warranty}</p>
          <p className="text-xs text-muted-foreground">Protected Purchase</p>
        </div>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <ShieldCheck className="h-4 w-4 text-info" />
      <span className="text-muted-foreground">{warranty}</span>
    </div>
  );
};

export default WarrantyBadge;
