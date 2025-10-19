'use client';

import { useCategoriesStore } from '@/hooks/use-categories';
import { Category } from '@/types';
import { useEffect } from 'react';

interface CategoriesHydrationProps {
  categories: Category[];
}

export default function CategoriesHydration({ categories }: CategoriesHydrationProps) {
  const setCategories = useCategoriesStore((state) => state.setCategories);

  useEffect(() => {
    if (categories && categories.length > 0) {
      setCategories(categories);
    }
  }, [categories, setCategories]);

  return null;
}