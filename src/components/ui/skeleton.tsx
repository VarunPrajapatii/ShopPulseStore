'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn("skeleton bg-gray-200 animate-pulse", className)} />
  );
};

// Cart Page Skeleton
export const CartSkeleton = () => {
  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        </div>

        {/* Trust Banner Skeleton */}
        <Skeleton className="h-16 w-full rounded-xl mb-8 hidden sm:block" />

        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex py-6 border-b border-gray-200">
                <Skeleton className="h-24 w-24 sm:h-48 sm:w-48 rounded-md" />
                <div className="ml-4 flex-1 sm:ml-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-5 w-24 mb-4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-10" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Skeleton */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-gray-50 rounded-xl p-6">
              <Skeleton className="h-7 w-32 mb-6" />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mt-6 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout Page Skeleton
export const CheckoutSkeleton = () => {
  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Skeleton className="h-4 w-24 mb-6" />

        {/* Header */}
        <div className="text-center mb-6">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto mt-2" />
        </div>

        {/* Progress */}
        <Skeleton className="h-12 w-full max-w-md mx-auto mb-8 rounded-lg" />

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Form Skeleton */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <Skeleton className="h-7 w-40 mb-6" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg mt-4" />
              <Skeleton className="h-12 w-full rounded-lg mt-4" />
              <Skeleton className="h-12 w-full rounded-lg mt-4" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
              <Skeleton className="h-7 w-32 mb-6" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2 mt-1" />
                      <Skeleton className="h-4 w-16 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-px w-full my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mt-6 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Billboard Skeleton
export const BillboardSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="aspect-square md:aspect-[2.4/1] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-4" />
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
};

// Product List Skeleton
export const ProductListSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
