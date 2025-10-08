'use client';

import { useStoreBillboardsStore } from "@/hooks/use-store-billboards";
import Billboard from "@/components/billboard";

const StoreBillboardsClient = () => {
  const storeBillboards = useStoreBillboardsStore((state) => state.storeBillboards);

  // Transform store billboards to billboard format
  const billboards = storeBillboards.map((item) => ({
    id: item.billboard.id,
    label: item.billboard.label,
    imageUrl: item.billboard.imageUrl,
  }));

  return <Billboard data={billboards} />;
};

export default StoreBillboardsClient;
