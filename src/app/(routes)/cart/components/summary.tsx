'use client';

import Button from '@/components/ui/button';
import Currency from '@/components/ui/currency';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const Summary = ({ 
  onCheckout, 
  itemsLength, 
  totalPrice,
  hasStockIssues = false
} : { 
  onCheckout: () => void, 
  itemsLength: number, 
  totalPrice: number,
  hasStockIssues?: boolean
}) => {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCheckout = () => {
    if (hasStockIssues) {
      toast.error('Please resolve stock issues before proceeding to checkout.');
      return;
    }
    onCheckout();
  };

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
      <Button 
        disabled={itemsLength === 0 || hasStockIssues} 
        onClick={handleCheckout} 
        className='w-full mt-6'
      >
        {hasStockIssues ? 'Resolve Stock Issues' : 'Checkout'}
      </Button>
      {hasStockIssues && (
        <p className="text-xs text-red-600 text-center mt-2">
          Update item quantities to proceed
        </p>
      )}
    </div>
  );
};

export default Summary;
