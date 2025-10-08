import { StoreBillboard } from '@/types';
import { create } from 'zustand';

interface StoreBillboardsStore {
  storeBillboards: StoreBillboard[];
  isLoading: boolean;
  error: string | null;
  setStoreBillboards: (storeBillboards: StoreBillboard[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearStoreBillboards: () => void;
}

export const useStoreBillboardsStore = create<StoreBillboardsStore>((set) => ({
  storeBillboards: [],
  isLoading: false,
  error: null,
  setStoreBillboards: (storeBillboards) => set({ storeBillboards, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearStoreBillboards: () => set({ storeBillboards: [], error: null }),
}));
