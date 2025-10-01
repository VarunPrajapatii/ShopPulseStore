"use client"

import { Product } from '@/types'
import React from 'react'
import Currency from '@/components/ui/currency'
import Button from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'

interface InfoProps {
    data: Product
}

const Info: React.FC<InfoProps> = ({ data }) => {
  return (
    <div>
      <h1 className='text-3xl font-bold text-gray-900'>{data.name}</h1>
      <div className='mt-3 flex items-end justify-between'>
        <div className='text-2xl text-gray-900'>
            <Currency amount={data?.price} />
        </div>
      </div>
      <div className='flex flex-col gap-y-6'>
        <hr className='my-4' />
        <div className='flex items-center gap-x-4'>
          <h3 className='font-semibold text-black'>Size:</h3>
          <div>
              {data?.size?.name}
          </div>
        </div>
      </div>
      <div>
        <Button className='flex items-center gap-x-2'>
          Add to Cart
          <ShoppingCart className='' />
        </Button>
      </div>
    </div>
  )
}

export default Info