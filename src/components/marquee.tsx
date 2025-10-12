'use client';

import React, { useEffect, useRef } from 'react';

const Marquee = () => {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeElement = marqueeRef.current;
    if (marqueeElement) {
      // Start animation after component mounts
      marqueeElement.style.animationPlayState = 'running';
    }
  }, []);

  const marqueeItems = ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'];

  return (
    <section className="overflow-hidden border-y-2 border-gray-200">
      <div
        ref={marqueeRef}
        className="flex whitespace-nowrap animate-marquee"
        style={{
          animationDuration: '15s',
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
              className="flex items-center justify-center px-6 lg:px-8 py-8 lg:py-12 relative"
            >
              {/* Checkmark icon */}
              <div className="mr-15 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10px"
                  height="10px"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <circle
                    cx="12.5"
                    cy="12.5"
                    r="8"
                    stroke="#121923"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              {/* Text */}
              <strong className="text-lg lg:text-3xl font-bold text-gray-800">
                {item}
              </strong>
            </div>
          ))}
        </div>

        {/* Cloned items for seamless loop */}
        <div className="flex flex-shrink-0" aria-hidden="true">
          {marqueeItems.map((item, index) => (
            <div
              key={`clone-${index}`}
              className="flex items-center justify-center px-6 lg:px-8 py-8 lg:py-12 relative"
            >
              {/* Checkmark icon */}
              <div className="mr-15 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10px"
                  height="10px"
                  viewBox="0 0 25 25"
                  fill="none"
                >
                  <circle
                    cx="12.5"
                    cy="12.5"
                    r="8"
                    stroke="#121923"
                    strokeWidth="1.2"
                  />
                </svg>
              </div>

              {/* Text */}
              <strong className="text-lg lg:text-3xl font-bold text-gray-800">
                {item}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .animate-marquee {
          animation-name: marquee;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation-play-state: paused !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Marquee;
