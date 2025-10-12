"use client"

import { Product } from '@/types'
import React from 'react'
import Currency from '@/components/ui/currency'
import Button from '@/components/ui/button'
import { ShoppingCart, Check } from 'lucide-react'
import useCart from '@/hooks/use-cart'

interface InfoProps {
    data: Product
}

const Info: React.FC<InfoProps> = ({ data }) => {
  // console.log("product data", data);
  const cart = useCart();

  const onAddToCart: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    cart.addItem(data);
  }

  // Function to format description with bold "Ingredients:" if present
  const formatDescription = (description: string) => {
    if (description.includes('Ingredients:')) {
      const parts = description.split('Ingredients:');
      return (
        <>
          {parts[0]}
          <br />
          <strong>Ingredients:</strong>
          {parts[1]}
        </>
      );
    }
    return description;
  };

  return (
    <div className="space-y-6">
      {/* Product Title and Price */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900 mb-3'>{data.name}</h1>
        {data.titlepoints && data.titlepoints.length > 0 && (
          <p className='text-sm text-gray-600 mb-4'>
            {data.titlepoints.join(' | ')}
          </p>
        )}
        <div className='flex items-end justify-between'>
          <div className='text-2xl text-gray-900 font-semibold'>
              <Currency amount={data?.price} />
          </div>
        </div>
      </div>

      <hr className='border-gray-200' />

      {/* Size */}
      <div className='flex items-center gap-x-4'>
        <h3 className='font-semibold text-black'>Size:</h3>
        <div className='px-3 py-1 bg-gray-100 rounded-md text-sm font-medium'>
            {data?.size?.name}
        </div>
      </div>

      {/* Description */}
      {data.description && (
        <div className="space-y-3">
          <h3 className='font-semibold text-black text-lg'>Description</h3>
          <p className='text-gray-700 leading-relaxed text-sm'>
            {formatDescription(data.description)}
          </p>
        </div>
      )}

      {/* Bullet Points */}
      {data.bulletPoints && data.bulletPoints.length > 0 && (
        <div className="space-y-3">
          <h3 className='font-semibold text-black text-lg'>Key Features</h3>
          <ul className='space-y-2'>
            {data.bulletPoints.map((point, index) => (
              <li key={index} className='flex items-start gap-3'>
                <div className='flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5'>
                  <Check size={12} className='text-green-600' />
                </div>
                <span className='text-gray-700 text-sm leading-relaxed'>
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr className='border-gray-200' />

      {/* Add to Cart Button */}
      <div className='pt-4'>
        <Button 
          onClick={onAddToCart} 
          className='w-full flex items-center justify-center gap-x-2 bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg font-medium transition-colors'
        >
          Add to Cart
          <ShoppingCart size={18} />
        </Button>
      </div>
    </div>
  )
}

export default Info