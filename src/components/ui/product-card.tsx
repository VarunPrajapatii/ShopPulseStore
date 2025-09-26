'use client';

import { Product } from '@/types';

interface ProductCardProps {
  data: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  return (
    <div className="bg-white cursor-pointer rounded-xl border p-3 space-y-4">
      {/* images and actions */}
      <div className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden">
        
      </div>
    </div>
  );
};

export default ProductCard;
