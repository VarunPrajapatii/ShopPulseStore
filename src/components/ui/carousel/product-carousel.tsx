'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, FreeMode } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface ProductCarouselProps {
  children: React.ReactNode[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({
  children,
  title,
  subtitle,
  showViewAll = false,
  viewAllHref = '#',
}) => {
  const swiperRef = useRef<SwiperType | null>(null);

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-6">
          <div>
            {title && (
              <h2 className="font-bold text-2xl md:text-3xl text-foreground">{title}</h2>
            )}
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showViewAll && (
              <a
                href={viewAllHref}
                className="text-sm font-medium text-primary hover:underline mr-4"
              >
                View All
              </a>
            )}
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="bg-muted hover:bg-border rounded-full p-2 hover-scale"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="bg-muted hover:bg-border rounded-full p-2 hover-scale"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
      <div className="overflow-hidden">
        <Swiper
          modules={[Navigation, A11y, FreeMode]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={16}
          slidesPerView={1.2}
          freeMode={{
            enabled: true,
            sticky: false,
          }}
          breakpoints={{
            480: {
              slidesPerView: 1.5,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2.2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 2.5,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3.2,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
          className="!overflow-visible"
        >
          {children.map((child, index) => (
            <SwiperSlide key={index} className="!h-auto">
              {child}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ProductCarousel;
