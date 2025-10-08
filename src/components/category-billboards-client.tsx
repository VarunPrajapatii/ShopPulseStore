'use client';

import { useCategoriesStore } from "@/hooks/use-categories";
import Billboard from "@/components/billboard";

interface CategoryBillboardsClientProps {
  categoryId: string;
}

const CategoryBillboardsClient = ({ categoryId }: CategoryBillboardsClientProps) => {
  const categories = useCategoriesStore((state) => state.categories);

  // Find the current category
  const currentCategory = categories.find((cat) => cat.id === categoryId);

  // Transform category billboards to billboard format
  const billboards = currentCategory?.billboard.map((item) => ({
    id: item.billboard.id,
    label: item.billboard.label,
    imageUrl: item.billboard.imageUrl,
  })) || [];

  // If no billboards found, don't render anything
  if (billboards.length === 0) {
    return null;
  }

  return <Billboard data={billboards} />;
};

export default CategoryBillboardsClient;
