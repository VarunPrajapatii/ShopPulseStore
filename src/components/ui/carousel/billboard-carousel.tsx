'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';
import { getOptimizedUrl, getBlurUrl } from '@/lib/cloudinary-utils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface BillboardCarouselProps {
  items: {
    id: string;
    label: string;
    imageUrl: string;
    imageAltText?: string | null;
  }[];
}

const BillboardCarousel: React.FC<BillboardCarouselProps> = ({ items }) => {
  const swiperRef = useRef<SwiperType | null>(null);

  if (!items || items.length === 0) {
    // Return a placeholder that maintains the aspect ratio
    return (
      <div className="relative w-full rounded-xl overflow-hidden aspect-square md:aspect-[2.4/1] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-4" />
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        spaceBetween={0}
        slidesPerView={1}
        loop={items.length > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        className="rounded-xl overflow-hidden aspect-square md:aspect-[2.4/1]"
      >
        {items.map((item, index) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full h-full">
              {item.imageUrl && (
                <Image
                  src={getOptimizedUrl(item.imageUrl, 'f_auto,q_auto')}
                  alt={item.imageAltText || item.label || 'Promotional banner'}
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                  {...(getBlurUrl(item.imageUrl) ? { placeholder: "blur" as const, blurDataURL: getBlurUrl(item.imageUrl) } : {})}
                  {...(index === 0 ? { priority: true } : { loading: 'lazy' as const })}
                />
              )}
              <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/20 relative z-10">
                <div className="font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-sm text-white drop-shadow-lg px-4">
                  {item.label}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {items.length > 1 && (
        <>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Previous billboard"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100"
            aria-label="Next billboard"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}
    </div>
  );
};

export default BillboardCarousel;
