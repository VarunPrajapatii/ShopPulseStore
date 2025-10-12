'use client';

import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';
import CartItem from './components/cart-item';
import Summary from './components/summary';
import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { useRouter } from 'next/navigation';

const CartPage = () => {
  const cart = useCart();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Map items with their quantities
  const itemsWithQuantity = cart.items.map(item => ({
    data: item,
    quantity: item.quantity || 1
  }));

  // Calculate total items count
  const totalItemsCount = cart.items.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);

  // Calculate total price
  const totalPrice = cart.items.reduce((total, item) => {
    return total + (Number(item.price) * (item.quantity || 1));
  }, 0);

  const onCheckout = () => {
    router.push('/checkout');
  };

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
                {itemsWithQuantity.map((item) => (
                  <CartItem
                    key={item.data.id}
                    data={item.data}
                    quantity={item.quantity}
                  />
                ))}
              </ul>
            </div>
            <Summary onCheckout={onCheckout} itemsLength={totalItemsCount} totalPrice={totalPrice} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartPage;
