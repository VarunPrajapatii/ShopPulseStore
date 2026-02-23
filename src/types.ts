export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
}

export interface StoreBillboard {
  id: string;
  storeId: string;
  billboardId: string;
  createdAt: string;
  billboard: {
    id: string;
    storeId: string;
    label: string;
    imageUrl: string;
    CreatedAt: string;
    updatedAt: string;
  };
}

export interface CategoryBillboard {
  id: string;
  categoryId: string;
  billboardId: string;
  createdAt: string;
  billboard: Billboard & {
    storeId: string;
    CreatedAt: string;
    updatedAt: string;
  };
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  billboard: CategoryBillboard[];
  storeId: string;
  CreatedAt: string;
  updatedAt: string;
}


export interface Specification {
  key: string;
  value: string;
}

// Product Variant for Myntra-style size selection
export interface ProductVariant {
  id: string;
  productId: string;
  sizeId: string;
  size: Size;
  stockQuantity: number;
  lowStockThreshold: number;
  sku: string | null;
  displayOrder: number;
  // Individual variant pricing (optional - falls back to product price if null)
  price: number | null;        // MRP / Original Price for this variant
  sellingPrice: number | null; // Discounted/Selling price for this variant
}

export interface Product {
  id: string
  name: string
  description: string
  shortDescription: string | null       // 160 char tagline for cards & SEO
  titlepoints: string[]
  bulletPoints: string[]
  price: string
  sellingPrice: number | null           // Discounted/sale price
  sku: string | null                    // Stock Keeping Unit / Model number
  specifications: Specification[] | null // Key-value product specs
  warranty: string | null               // Warranty information
  isFeatured: boolean
  isArchived: boolean
  
  // Inventory System - supports both variant and non-variant products
  hasVariants: boolean                  // TRUE = size variants, FALSE = single stock
  baseStockQuantity: number             // Stock when hasVariants=false
  baseLowStockThreshold: number         // Threshold when hasVariants=false
  variants: ProductVariant[]            // Size variants (when hasVariants=true)
  
  category: Category
  images: Image[]
  relatedItems: Product[]
  quantity?: number                     // For cart items
  createdAt: string
  updatedAt: string
}

export interface UpcomingProduct {
  id: string
  name: string
  price: string
  imageUrl: string
  storeId: string
  categoryId: string
  CreatedAt: string
  updatedAt: string
  category: Category
}

export type MediaType = 'IMAGE' | 'VIDEO' | 'GIF';

export interface Image {
  id: string
  url: string
  bytes?: number
  width?: number
  height?: number
  format?: string
  type?: MediaType
  duration?: number | null
  position?: number
  altText?: string | null
  isFeatured?: boolean
}

export interface Size {
  id: string
  name: string
  value: string
}

export interface StoreSEOConfig {
  storeName: string;
  storeUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  logoUrl: string | null;
  socialLinks: {
    facebook?: string | null;
    instagram?: string | null;
    twitter?: string | null;
  } | null;
  keywords: string[] | null;
}

// Announcement Bar types
export interface AnnouncementMessage {
  text: string;
  emoji?: string;
  linkId?: string;
  linkType?: 'category' | 'product';
}

export interface AnnouncementBar {
  id: string;
  storeId: string;
  messages: AnnouncementMessage[];
  backgroundColor: string;
  dismissible: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Store info types
export interface StoreInfo {
  id: string;
  name: string;
  promotionalBanner?: string;
  createdAt: string;
  updatedAt: string;
}