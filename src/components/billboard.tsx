'use client';

import { Billboard as BillboardType } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface BillboardProps {
  data: BillboardType[];
}

const Billboard: React.FC<BillboardProps> = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePrevious = () => {
    if (isAnimating) return;
    setDirection('left');
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? data.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = useCallback(() => {
    if (isAnimating) return;
    setDirection('right');
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => 
      prevIndex === data.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, data.length]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setDirection(index > currentIndex ? 'right' : 'left');
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-rotate billboards every 4 seconds
  useEffect(() => {
    if (data.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [data.length, handleNext]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative rounded-xl overflow-hidden">
        {/* Billboard Container with Sliding Animation */}
        <div className="relative aspect-square md:aspect-[2.4/1]">
          {data.map((billboard, index) => (
            <div
              key={billboard.id}
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out ${
                index === currentIndex
                  ? 'translate-x-0 opacity-100'
                  : index < currentIndex
                  ? direction === 'right'
                    ? '-translate-x-full opacity-0'
                    : 'translate-x-full opacity-0'
                  : direction === 'right'
                  ? 'translate-x-full opacity-0'
                  : '-translate-x-full opacity-0'
              }`}
              style={{
                backgroundImage: `url(${billboard?.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="h-full w-full flex flex-col justify-center items-center text-center gap-y-8 bg-black/20">
                <div className='font-bold text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-sm text-white drop-shadow-lg px-4'>
                  {billboard.label}
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Buttons - Only show if more than 1 billboard */}
          {data.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={isAnimating}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous billboard"
              >
                <ChevronLeft size={24} className="text-gray-800" />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={isAnimating}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next billboard"
              >
                <ChevronRight size={24} className="text-gray-800" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {data.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    disabled={isAnimating}
                    className={`h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                      index === currentIndex 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/75 w-2'
                    }`}
                    aria-label={`Go to billboard ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billboard;