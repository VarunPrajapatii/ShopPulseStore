/**
 * Shares the store identity fetched by the root layout with client components.
 * Navigation, footer, and checkout use the same API data and fallback branding.
 */
'use client';

import { createContext, useContext } from 'react';
import { brandLogoFallback, brandNameFallback } from '@/config/site';

interface StoreBrand {
  name: string;
  logoUrl: string;
}

const StoreBrandContext = createContext<StoreBrand>({
  name: brandNameFallback,
  logoUrl: brandLogoFallback,
});

export function StoreBrandProvider({
  brand,
  children,
}: {
  brand: StoreBrand;
  children: React.ReactNode;
}) {
  return (
    <StoreBrandContext.Provider value={brand}>
      {children}
    </StoreBrandContext.Provider>
  );
}

export function useStoreBrand() {
  return useContext(StoreBrandContext);
}
