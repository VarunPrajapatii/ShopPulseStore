'use client';

import { useCategoriesStore } from "@/hooks/use-categories";

interface CategoryHeaderProps {
  categoryId: string;
}

const CategoryHeader = ({ categoryId }: CategoryHeaderProps) => {
  const categories = useCategoriesStore((state) => state.categories);
  const currentCategory = categories.find((cat) => cat.id === categoryId);

  if (!currentCategory) {
    return null;
  }

  return (
    <header className="px-4 sm:px-6 lg:px-8 pb-6">
      <h1 className="text-3xl font-bold text-gray-900">
        {currentCategory.name}
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Browse our collection of {currentCategory.name.toLowerCase()}
      </p>
    </header>
  );
};

export default CategoryHeader;
