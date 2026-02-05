'use client';

import { useStoreBillboardsStore } from "@/hooks/use-store-billboards";
import { BillboardCarousel } from "@/components/ui/carousel";
import { useState, useEffect } from "react";

const StoreBillboardsClient = () => {
  const storeBillboards = useStoreBillboardsStore((state) => state.storeBillboards);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show skeleton while not mounted or while loading
  // This reserves the space and prevents layout shift
  if (!isMounted || storeBillboards.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative w-full rounded-xl overflow-hidden aspect-square md:aspect-[2.4/1] bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-4" />
            <div className="h-4 w-32 bg-gray-300 rounded mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Transform store billboards to billboard format
  const billboards = storeBillboards.map((item) => ({
    id: item.billboard.id,
    label: item.billboard.label,
    imageUrl: item.billboard.imageUrl,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4 animate-fade-in">
      <BillboardCarousel items={billboards} />
    </div>
  );
};

export default StoreBillboardsClient;
