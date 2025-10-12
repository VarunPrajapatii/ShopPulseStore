'use client';

import { useStoreBillboardsStore } from '@/hooks/use-store-billboards';
import { StoreBillboard } from '@/types';
import { useEffect } from 'react';

interface StoreBillboardsHydrationProps {
  storeBillboards: StoreBillboard[];
}

export default function StoreBillboardsHydration({ storeBillboards }: StoreBillboardsHydrationProps) {
  const setStoreBillboards = useStoreBillboardsStore((state) => state.setStoreBillboards);

  useEffect(() => {
    // console.log("Hydrating store billboards:", storeBillboards);
    if (storeBillboards && storeBillboards.length > 0) {
      setStoreBillboards(storeBillboards);
    }
  }, [storeBillboards, setStoreBillboards]);

  return null;
}
