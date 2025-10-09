"use client"

import { UpcomingProduct } from "@/types"
import Image from "next/image"
import Currency from "@/components/ui/currency"

interface UpcomingProductCardProps {
  data: UpcomingProduct
}

const UpcomingProductCard: React.FC<UpcomingProductCardProps> = ({ data }) => {
  return (
    <div className="group rounded-xl p-3 space-y-4">
      {/* Image */}
      <div className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden">
        <Image
          src={data.imageUrl}
          alt={data.name}
          fill
          className="object-cover aspect-square rounded-md"
        />
        {/* Coming Soon Badge */}
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          Coming Soon
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="font-semibold text-lg">
          {data.name}
        </p>
        <p className='text-sm text-gray-500'>
          {data.category?.name}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between text-xl">
        <Currency amount={data.price} />
      </div>
    </div>
  )
}

export default UpcomingProductCard
