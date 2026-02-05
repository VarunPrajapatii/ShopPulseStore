import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Product, ProductVariant } from "@/types";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

/**
 * Get the effective price for a product variant
 * Priority: variant.sellingPrice > variant.price > product.sellingPrice > product.price
 */
export function getEffectivePrice(product: Product, variant?: ProductVariant | null): number {
  if (variant) {
    if (variant.sellingPrice != null) {
      return variant.sellingPrice;
    }
    if (variant.price != null) {
      return variant.price;
    }
  }
  
  if (product.sellingPrice != null) {
    return product.sellingPrice;
  }
  
  return Number(product.price);
}

/**
 * Get display prices for a product/variant including MRP, selling price, and discount info
 */
export function getDisplayPrices(product: Product, variant?: ProductVariant | null): {
  mrp: number;
  sellingPrice: number;
  hasDiscount: boolean;
  discountPercent: number;
} {
  // Get MRP (variant price takes precedence)
  const mrp = variant?.price ?? Number(product.price);
  
  // Get selling price (priority: variant.sellingPrice > variant.price > product.sellingPrice > product.price)
  const sellingPrice = variant?.sellingPrice ?? variant?.price ?? product.sellingPrice ?? Number(product.price);
  
  const hasDiscount = sellingPrice < mrp;
  const discountPercent = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
  
  return {
    mrp,
    sellingPrice,
    hasDiscount,
    discountPercent,
  };
}

/**
 * Get price range for a product with variants
 * Returns min and max selling prices across all variants
 */
export function getVariantPriceRange(product: Product): {
  minPrice: number;
  maxPrice: number;
  hasRange: boolean;
} {
  if (!product.hasVariants || !product.variants || product.variants.length === 0) {
    const price = product.sellingPrice ?? Number(product.price);
    return { minPrice: price, maxPrice: price, hasRange: false };
  }
  
  const prices = product.variants.map(variant => {
    // Use variant selling price, or variant price, or product selling price, or product price
    return variant.sellingPrice ?? variant.price ?? product.sellingPrice ?? Number(product.price);
  });
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return {
    minPrice,
    maxPrice,
    hasRange: minPrice !== maxPrice,
  };
}

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];