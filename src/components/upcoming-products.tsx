import React from 'react'
import { UpcomingProduct } from '@/types'
import UpcomingProductCard from '@/components/ui/upcoming-product-card'
import NoResults from '@/components/ui/no-results'

interface UpcomingProductsProps {
  items: UpcomingProduct[]
}

const UpcomingProducts: React.FC<UpcomingProductsProps> = ({ items }) => {
  return (
    <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h3 className="font-bold text-3xl text-center">Upcoming Products</h3>
        {items.length === 0 && <NoResults />}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <UpcomingProductCard key={item.id} data={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UpcomingProducts