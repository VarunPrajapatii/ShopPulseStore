'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, A11y, FreeMode } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';
import Link from 'next/link';
import { Category } from '@/types';
import { useInView } from '@/hooks/use-in-view';
import { getOptimizedUrl, getBlurUrl } from '@/lib/cloudinary-utils';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface CategoryCarouselProps {
  categories: Category[];
}

// Helper to check if imageUrl is valid
const isValidImageUrl = (url: unknown): url is string => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return false;
  // Must start with http://, https://, or /
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
};

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories }) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const { ref, isInView } = useInView({ threshold: 0.1 });

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className={`w-full py-10 scroll-animate ${isInView ? 'in-view' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-2xl md:text-3xl text-foreground">Shop by Category</h2>
          <p className="text-muted-foreground mt-1">Find what you&apos;re looking for</p>
        </div>
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="bg-muted hover:bg-border rounded-full p-2 hover-scale"
            aria-label="Previous category"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="bg-muted hover:bg-border rounded-full p-2 hover-scale"
            aria-label="Next category"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div>
        <Swiper
          modules={[Navigation, A11y, FreeMode]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={16}
          slidesPerView={2.2}
          freeMode={{
            enabled: true,
            sticky: false,
          }}
          breakpoints={{
            480: {
              slidesPerView: 2.5,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 3.2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 6,
              spaceBetween: 24,
            },
          }}
          className="!overflow-visible"
        >
          {categories.map((category) => (
            <SwiperSlide key={category.id}>
              <Link
                href={`/category/${category.id}`}
                className="group block"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted shadow-sm card-hover">
                  {isValidImageUrl(category.imageUrl) ? (
                    <Image
                      src={getOptimizedUrl(category.imageUrl, 'f_auto,q_auto,w_300,h_300,c_fill')}
                      alt={category.imageAltText || category.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                      {...(getBlurUrl(category.imageUrl) ? { placeholder: "blur" as const, blurDataURL: getBlurUrl(category.imageUrl) } : {})}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border">
                      <span className="text-muted-foreground text-4xl font-bold">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Overlay gradient - stronger for better text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  {/* Category Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-bold text-white text-sm md:text-base truncate drop-shadow-md">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default CategoryCarousel;
