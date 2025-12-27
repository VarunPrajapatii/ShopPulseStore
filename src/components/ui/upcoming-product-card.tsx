'use client';

import { UpcomingProduct } from '@/types';
import Image from 'next/image';
import Currency from '@/components/ui/currency';
import { Sparkles } from 'lucide-react';

interface UpcomingProductCardProps {
  data: UpcomingProduct;
}

const UpcomingProductCard: React.FC<UpcomingProductCardProps> = ({ data }) => {
  return (
    <div className="bg-card group rounded-xl border border-border p-3 space-y-4">
      {/* Image */}
      <div className="aspect-square rounded-xl bg-muted relative overflow-hidden">
        <Image
          src={data.imageUrl}
          alt={data.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover aspect-square rounded-md"
        />
        {/* Badges Container - Top Left for NEW, Top Right for Out of Stock */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {/* NEW Badge */}
          
            <div className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Coming Soon
            </div>
          
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="font-semibold text-lg text-foreground">
          {data.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {data.category?.name}
        </p>
      </div>

      {/* Price */}
      <div className="flex items-center justify-between text-xl">
        <Currency amount={data.price} />
      </div>
    </div>
  );
};

export default UpcomingProductCard;
