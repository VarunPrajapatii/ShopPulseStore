'use client';

import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';
import CartItem from './components/cart-item';
import Summary from './components/summary';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';

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

  // Check for stock issues
  const stockIssues = cart.items.filter(item => {
    const requestedQty = item.quantity || 1;
    return requestedQty > item.stockQuantity;
  });

  const hasStockIssues = stockIssues.length > 0;

  // Calculate total items count
  const totalItemsCount = cart.items.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);

  // Calculate total price
  const totalPrice = cart.items.reduce((total, item) => {
    return total + (Number(item.price) * (item.quantity || 1));
  }, 0);

  const onCheckout = () => {
    if (hasStockIssues) {
      return; // Prevent checkout if there are stock issues
    }
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
          
          {/* Stock Issues Warning */}
          {hasStockIssues && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Insufficient Stock for Some Items
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {stockIssues.map((item) => (
                      <li key={item.id}>
                        <strong>{item.name}</strong>: You requested {item.quantity || 1}, but only{' '}
                        <strong>{item.stockQuantity}</strong> available.
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    Please update the quantities before proceeding to checkout.
                  </p>
                </div>
              </div>
            </div>
          )}

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
            <Summary 
              onCheckout={onCheckout} 
              itemsLength={totalItemsCount} 
              totalPrice={totalPrice}
              hasStockIssues={hasStockIssues}
            />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default CartPage;
