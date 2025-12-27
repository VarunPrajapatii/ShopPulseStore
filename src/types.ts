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

export interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string | null  // NEW: 160 char tagline for cards & SEO
  titlepoints: string[]
  bulletPoints: string[]
  price: string
  sellingPrice?: number | null      // NEW: Discounted/sale price
  sku?: string | null               // NEW: Stock Keeping Unit / Model number
  specifications?: Specification[] | null  // NEW: Key-value product specs
  warranty?: string | null          // NEW: Warranty information
  isFeatured: boolean
  isArchived: boolean
  stockQuantity: number
  lowStockThreshold: number
  category: Category
  size: Size
  images: Image[]
  relatedItems: Product[]
  quantity?: number // Optional quantity field for cart items
  createdAt?: string // Creation date from backend (lowercase 'c')
  updatedAt?: string // Last update date from backend
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

export interface Image {
  id: string
  url: string
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