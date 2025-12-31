"use client"

import React from 'react'
import { ProductVariant } from '@/types'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
  disabled?: boolean;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  variants,
  selectedVariant,
  onSelect,
  disabled = false,
}) => {
  // Sort variants by displayOrder (ensure it's an array)
  const sortedVariants = Array.isArray(variants)
    ? [...variants].sort((a, b) => a.displayOrder - b.displayOrder)
    : [];
  
  // Check stock status
  const isInStock = (variant: ProductVariant) => variant.stockQuantity > 0;
  const isLowStock = (variant: ProductVariant) => 
    variant.stockQuantity > 0 && variant.stockQuantity <= variant.lowStockThreshold;
  
  if (sortedVariants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          Select Size
          {selectedVariant && (
            <span className="ml-2 font-normal text-primary">
              — {selectedVariant.size.name}
            </span>
          )}
        </h3>
        <button 
          type="button"
          className="text-sm text-primary hover:underline"
          onClick={() => {/* TODO: Implement size guide modal */}}
        >
          Size Guide
        </button>
      </div>
      
      {/* Size Grid */}
      <div className="flex flex-wrap gap-2">
        {sortedVariants.map((variant) => {
          const inStock = isInStock(variant);
          const lowStock = isLowStock(variant);
          const isSelected = selectedVariant?.id === variant.id;
          
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => inStock && !disabled && onSelect(variant)}
              disabled={!inStock || disabled}
              className={cn(
                "relative min-w-[56px] h-12 px-4 border-2 rounded-lg font-medium text-sm transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                // Default state
                inStock && !isSelected && "border-border bg-background text-foreground hover:border-primary",
                // Selected state
                isSelected && "border-primary bg-primary/10 text-primary",
                // Out of stock state
                !inStock && "border-border/50 bg-muted/50 text-muted-foreground cursor-not-allowed line-through",
                // Disabled state
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Size name */}
              <span>{variant.size.name}</span>
              
              {/* Sold out diagonal line */}
              {!inStock && (
                <span 
                  className="absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <div className="absolute w-full h-[1px] bg-muted-foreground rotate-45 origin-center" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Stock Status Messages */}
      {selectedVariant && (
        <div className="space-y-1">
          {isLowStock(selectedVariant) && (
            <div className="flex items-center gap-2 text-sm text-warning">
              <AlertTriangle className="h-4 w-4" />
              <span>Only {selectedVariant.stockQuantity} left in stock - order soon!</span>
            </div>
          )}
          
          {/* SKU Display */}
          {selectedVariant.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: <span className="font-mono">{selectedVariant.sku}</span>
            </p>
          )}
        </div>
      )}
      
      {/* Prompt to select size if none selected */}
      {!selectedVariant && variants.some(isInStock) && (
        <p className="text-sm text-muted-foreground">
          Please select a size to add to cart
        </p>
      )}
      
      {/* All sold out message */}
      {!variants.some(isInStock) && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-error" />
          <span className="text-sm text-error font-medium">
            All sizes are currently out of stock
          </span>
        </div>
      )}
    </div>
  )
}

export default SizeSelector;
