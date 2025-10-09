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
  billboard: CategoryBillboard[]; // Changed from billboards to billboard
  storeId: string; // Made optional to match API
  CreatedAt: string;
  updatedAt: string;
}


export interface Product {
  id: string
  name: string
  description: string
  bulletPoints: string[]
  price: string
  isFeatured: boolean
  isArchived: boolean
  category: Category
  size: Size
  images: Image[]
  relatedItems: Product[]
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