'use client';

import { Product } from '@/types';
import Image from 'next/image';
import IconButton from '@/components/ui/icon-button';
import { Expand, ShoppingCart } from 'lucide-react';
import Currency from '@/components/ui/currency';

interface ProductCardProps {
  data: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
  return (
    <div className="bg-white group cursor-pointer rounded-xl border p-3 space-y-4">
      {/* images and actions */}
      <div className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden">
        <Image
          src={data?.images?.[0]?.url}
          alt={data.name}
          fill
          className="object-cover aspect-square rounded-md"
        />

        <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5">
          <div className='flex gap-x-6 justify-center'>
             <IconButton 
              onClick={() => {}}
              icon={<Expand size={20} className='text-gray-600' />}
             />
             <IconButton 
              onClick={() => {}}
              icon={<ShoppingCart size={20} className='text-gray-600' />}
             />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <p className='font-semibold text-lg'>
          {data.name}
        </p>
        <p className='text-sm text-gray-500'>
          {data.category?.name}
        </p>
      </div>

      {/* Price */}
      <div className='flex items-center justify-between '>
        <Currency amount={data.price} />
      </div>
    </div>
  );
};

export default ProductCard;
