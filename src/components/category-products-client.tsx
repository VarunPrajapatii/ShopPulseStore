'use client';

import { Product } from "@/types";
import { useState } from "react";
import ProductCard from "@/components/ui/product-card";
import NoResults from "@/components/ui/no-results";

interface CategoryProductsClientProps {
  products: Product[];
}

const CategoryProductsClient = ({ products }: CategoryProductsClientProps) => {
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'default' | 'price-asc' | 'price-desc' | 'name')}
            className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="default">Default</option>
            <option value="name">Name (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryProductsClient;
