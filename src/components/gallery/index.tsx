'use client';

import { Tab } from '@headlessui/react'
import { Image as ImageType } from '@/types';
import GalleryTab from '@/components/gallery/gallery-tab';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getOptimizedUrl, sortImagesByPosition, getAltText, getBlurUrl } from '@/lib/cloudinary-utils';

interface GalleryProps {
  images: ImageType[];
  productName?: string;
}

const Gallery: React.FC<GalleryProps> = ({ images, productName = 'Product image' }) => {
  // Sort images by position field
  const sortedImages = useMemo(() => sortImagesByPosition(images), [images]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sortedImages.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < sortedImages.length - 1 ? prev + 1 : 0));
  };

  // Check scroll state for thumbnail carousel
  const checkScrollState = () => {
    const container = thumbnailContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    checkScrollState();
    const container = thumbnailContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollState);
      // Also check on resize
      window.addEventListener('resize', checkScrollState);
      return () => {
        container.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
  }, [images]);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    const container = thumbnailContainerRef.current;
    if (container) {
      const scrollAmount = 120; // Width of one thumbnail + gap
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Get thumbnails excluding the currently selected image
  const thumbnailImages = images.filter((_, index) => index !== selectedIndex);

  return (
    <Tab.Group as="div" className="flex flex-col-reverse" selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        {/* Thumbnail Carousel */}
        <div className='mx-auto mt-6 w-full max-w-2xl hidden sm:block lg:max-w-none'>
          <div className="relative">
            {/* Left scroll button */}
            {canScrollLeft && sortedImages.length > 4 && (
              <button
                onClick={() => scrollThumbnails('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-110 -ml-3"
                aria-label="Scroll thumbnails left"
              >
                <ChevronLeft size={16} className="text-gray-700" />
              </button>
            )}
            
            {/* Thumbnails container */}
            <div 
              ref={thumbnailContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {sortedImages.map((image, index) => (
                <div key={image.id} className="flex-shrink-0">
                  <GalleryTab 
                    image={image} 
                    isSelected={index === selectedIndex}
                    productName={productName}
                  />
                </div>
              ))}
            </div>

            {/* Right scroll button */}
            {canScrollRight && sortedImages.length > 4 && (
              <button
                onClick={() => scrollThumbnails('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-md transition-all duration-200 hover:scale-110 -mr-3"
                aria-label="Scroll thumbnails right"
              >
                <ChevronRight size={16} className="text-gray-700" />
              </button>
            )}
          </div>
        </div>
        
        {/* Selected Image with Navigation */}
        <div className="relative w-full max-w-xl mx-auto">
          <Tab.Panels className="aspect-square w-full">
              {sortedImages.map((image, index) => (
                  <Tab.Panel key={image.id}>
                      <div className='aspect-square relative h-full w-full sm:rounded-lg overflow-hidden'>
                          <Image
                              fill
                              src={getOptimizedUrl(image.url, 'f_auto,q_auto')}
                              alt={getAltText(image, `${productName} - Image ${index + 1}`)}
                              className='object-cover object-center'
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px"
                              {...(getBlurUrl(image.url) ? { placeholder: "blur" as const, blurDataURL: getBlurUrl(image.url) } : {})}
                              {...(index === 0 ? { priority: true } : { loading: 'lazy' as const })}
                          />
                      </div>
                  </Tab.Panel>
              ))}
          </Tab.Panels>
          
          {/* Navigation Buttons */}
          {sortedImages.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} className="text-gray-800" />
              </button>
              
              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next image"
              >
                <ChevronRight size={20} className="text-gray-800" />
              </button>
            </>
          )}
        </div>
    </Tab.Group>
  )
}

export default Gallery