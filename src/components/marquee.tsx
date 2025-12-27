'use client';

import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const Marquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeElement = marqueeRef.current;
    if (marqueeElement) {
      // Start animation after component mounts
      marqueeElement.style.animationPlayState = 'running';
    }
  }, []);

  // Generic marquee items that work for most stores
  const marqueeItems = [
    'Premium Quality',
    'Fast Delivery',
    'Customer Favorite',
    'Top Rated',
    'Trusted Brand',
    'Best Sellers',
    'Free Shipping',
    'Easy Returns',
  ];

  return (
    <section className="overflow-hidden bg-primary py-4 md:py-5 my-12">
      <div
        ref={marqueeRef}
        className="flex whitespace-nowrap animate-marquee"
        style={{
          animationDuration: '30s',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: 'paused',
        }}
      >
        {/* Original items */}
        <div className="flex flex-shrink-0">
          {marqueeItems.map((item, index) => (
            <div
              key={`original-${index}`}
              className="flex items-center justify-center"
            >
              {/* Star icon */}
              <Star className="w-5 h-5 lg:w-6 lg:h-6 mx-8 text-primary-foreground fill-primary-foreground" />
              {/* Text */}
              <span className="text-lg lg:text-2xl font-bold text-primary-foreground uppercase tracking-wider">
                {item}
              </span>
            </div>
          ))}
        </div>

        {/* Cloned items for seamless loop */}
        <div className="flex flex-shrink-0" aria-hidden="true">
          {marqueeItems.map((item, index) => (
            <div
              key={`clone-${index}`}
              className="flex items-center justify-center px-8 lg:px-12"
            >
              {/* Star icon */}
              <Star className="w-5 h-5 lg:w-6 lg:h-6 mr-4 text-primary-foreground fill-primary-foreground" />
              {/* Text */}
              <span className="text-lg lg:text-2xl font-bold text-primary-foreground uppercase tracking-wider">
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;
