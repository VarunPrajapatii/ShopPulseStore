'use client';

import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';
import CartItem from './components/cart-item';
import Summary from './components/summary';
import { useEffect, useState } from 'react';
import { Product } from '@/types';

const CartPage = () => {
  const cart = useCart();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Group items by ID and count quantities
  const groupedItems = cart.items.reduce((acc, item) => {
    const existingItem = acc.find(
      (groupedItem) => groupedItem.data.id === item.id
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      acc.push({ data: item, quantity: 1 });
    }
    return acc;
  }, [] as { data: Product; quantity: number }[]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="bg-white">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black ">Shopping Cart</h1>
          <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
            <div className="lg:col-span-7">
              {cart.items.length === 0 && (
                <p className="text-neutral-500">No items added to the cart.</p>
              )}
              <ul>
                {groupedItems.map((item) => (
                  <CartItem
                    key={item.data.id}
                    data={item.data}
                    quantity={item.quantity}
                  />
                ))}
              </ul>
            </div>
            <Summary />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartPage;
