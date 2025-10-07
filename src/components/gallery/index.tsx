'use client';

import { Tab } from '@headlessui/react'
import { Image as ImageType } from '@/types';
import GalleryTab from '@/components/gallery/gallery-tab';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface GalleryProps {
  images: ImageType[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Tab.Group as="div" className="flex flex-col-reverse" selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <div className='mx-auto mt-6 w-full max-w-2xl hidden sm:block lg:max-w-none'>
            <Tab.List className="grid grid-cols-4 gap-6">
                {images.map((image) => (
                    <GalleryTab key={image.id} image={image} />
                ))}
            </Tab.List>
        </div>
        
        {/* Selected Image with Navigation */}
        <div className="relative w-full max-w-xl mx-auto">
          <Tab.Panels className="aspect-square w-full">
              {images.map((image) => (
                  <Tab.Panel key={image.id}>
                      <div className='aspect-square relative h-full w-full sm:rounded-lg overflow-hidden'>
                          <Image
                              fill
                              src={image.url}
                              alt="Selected product image"
                              className='object-cover object-center'
                          />
                      </div>
                  </Tab.Panel>
              ))}
          </Tab.Panels>
          
          {/* Navigation Buttons */}
          {images.length > 1 && (
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