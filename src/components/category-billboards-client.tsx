'use client';

import { useCategoriesStore } from "@/hooks/use-categories";
import Billboard from "@/components/billboard";
import { useState, useEffect } from "react";

interface CategoryBillboardsClientProps {
  categoryId: string;
}

const CategoryBillboardsClient = ({ categoryId }: CategoryBillboardsClientProps) => {
  const categories = useCategoriesStore((state) => state.categories);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Find the current category
  const currentCategory = categories.find((cat) => cat.id === categoryId);

  // Transform category billboards to billboard format
  const billboards = currentCategory?.billboard.map((item) => ({
    id: item.billboard.id,
    label: item.billboard.label,
    imageUrl: item.billboard.imageUrl,
    imageAltText: item.billboard.imageAltText,
  })) || [];

  // Show skeleton while not mounted or no billboards yet
  // This reserves the space and prevents layout shift
  if (!isMounted || (categories.length > 0 && billboards.length === 0 && !currentCategory)) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="relative w-full rounded-xl overflow-hidden aspect-square md:aspect-[2.4/1] bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-4" />
            <div className="h-4 w-32 bg-gray-300 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // If category exists but has no billboards, render nothing (collapse)
  if (currentCategory && billboards.length === 0) {
    return null;
  }

  // If billboards exist, show them with animation
  if (billboards.length > 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
        <Billboard data={billboards} />
      </div>
    );
  }

  // Fallback skeleton for loading state
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="relative w-full rounded-xl overflow-hidden aspect-square md:aspect-[2.4/1] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-4" />
          <div className="h-4 w-32 bg-gray-300 rounded mx-auto" />
        </div>
      </div>
    </div>
  );
};

export default CategoryBillboardsClient;
