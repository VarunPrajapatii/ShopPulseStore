'use client';

/**
 * Whether the store's prices include GST shown to the buyer (regular GST seller).
 *
 * Reads the store info once per page load and shares the answer between every price
 * on the page. Returns null until known, so no GST wording flashes in for stores
 * that do not charge it. Used by PriceDisplay.
 */

import { useEffect, useState } from 'react';
import getStoreInfo from '@/actions/get-store-info';

let pending: Promise<boolean> | null = null;

function loadGstApplies(): Promise<boolean> {
  if (!pending) {
    pending = getStoreInfo().then((info) => info?.gstApplies === true);
  }
  return pending;
}

export default function useStoreGstApplies(): boolean | null {
  const [gstApplies, setGstApplies] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadGstApplies().then((value) => {
      if (!cancelled) setGstApplies(value);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return gstApplies;
}
