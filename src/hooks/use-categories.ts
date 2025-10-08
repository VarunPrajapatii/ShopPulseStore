import { Category } from '@/types';
import { create } from 'zustand';

interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCategories: () => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  setCategories: (categories) => set({ categories, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearCategories: () => set({ categories: [], error: null }),
}));