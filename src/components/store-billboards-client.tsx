'use client';

import { useStoreBillboardsStore } from "@/hooks/use-store-billboards";
import { BillboardCarousel } from "@/components/ui/carousel";

const StoreBillboardsClient = () => {
  const storeBillboards = useStoreBillboardsStore((state) => state.storeBillboards);

  // Transform store billboards to billboard format
  const billboards = storeBillboards.map((item) => ({
    id: item.billboard.id,
    label: item.billboard.label,
    imageUrl: item.billboard.imageUrl,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-4">
      <BillboardCarousel items={billboards} />
    </div>
  );
};

export default StoreBillboardsClient;
