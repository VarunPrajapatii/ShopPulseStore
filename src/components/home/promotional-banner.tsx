'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';

interface PromotionalBannerProps {
  imageUrl?: string | null;
}

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ imageUrl }) => {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  if (!imageUrl) {
    return null;
  }

  return (
    <section ref={ref} className={`w-full py-10 scroll-animate-scale ${isInView ? 'in-view' : ''}`}>
      <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden image-zoom">
        <Image
          src={imageUrl}
          alt="Promotional Banner"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        {/* Overlay with CTA - can be customized */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent">
          <div className="h-full flex flex-col justify-center px-6 md:px-12 max-w-lg">
            <span className="text-white/80 text-sm font-medium tracking-wider uppercase mb-2">
              Special Offer
            </span>
            <h2 className="text-white text-2xl md:text-4xl font-bold mb-3">
              Discover Our Collection
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-6 hidden sm:block">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Shop now and save big.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-background text-foreground px-5 py-2.5 rounded-full font-medium text-sm btn-press w-fit"
            >
              Shop Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionalBanner;
