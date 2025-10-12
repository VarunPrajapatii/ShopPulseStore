'use client';

import Button from '@/components/ui/button';
import Currency from '@/components/ui/currency';
import useCart from '@/hooks/use-cart';
import React, { useEffect, useState } from 'react';

const Summary = ({ onCheckout, itemsLength, totalPrice } : { onCheckout: () => void, itemsLength: number, totalPrice: number }) => {

  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-medium text-gray-900">
        Order Summary
      </h2>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-medium text-gray-900">
            Order Total
          </div>
          <Currency amount={totalPrice} />
        </div>
      </div>
      <Button disabled={itemsLength === 0} onClick={onCheckout} className='w-full mt-6'>
        Checkout
      </Button>
    </div>
  );
};

export default Summary;
