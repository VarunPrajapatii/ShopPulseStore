'use client';

import Button from '@/components/ui/button';
import Currency from '@/components/ui/currency';
import TrustBadges from '@/components/ui/trust-badges';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowRight, Lock, Tag, Truck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SummaryProps { 
  onCheckout: () => void;
  itemsLength: number;
  totalPrice: number;
  hasStockIssues?: boolean;
}

const Summary: React.FC<SummaryProps> = ({ 
  onCheckout, 
  itemsLength, 
  totalPrice,
  hasStockIssues = false
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

  // Calculate breakdown (shipping is free above ₹499)
  const subtotal = totalPrice;
  const shippingThreshold = 499;
  const shippingCost = subtotal >= shippingThreshold ? 0 : 49;
  const tax = 0; // Tax included in price
  const orderTotal = subtotal + shippingCost + tax;

  if (!isMounted) {
    return null;
  }

  return (
    <div className="mt-16 rounded-xl bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 lg:sticky lg:top-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Order Summary
      </h2>

      {/* Price Breakdown */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Subtotal ({itemsLength} {itemsLength === 1 ? 'item' : 'items'})</span>
          <Currency amount={subtotal} />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Truck className="h-4 w-4" />
            <span>Shipping</span>
          </div>
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium">FREE</span>
          ) : (
            <Currency amount={shippingCost} />
          )}
        </div>

        {shippingCost > 0 && (
          <div className="bg-amber-50 rounded-lg p-3 text-xs text-amber-800">
            <p>
              Add <strong>{formatPrice(shippingThreshold - subtotal)}</strong> more for FREE shipping!
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tax (Included)</span>
          <span className="text-gray-500">₹0</span>
        </div>

        {/* Coupon Placeholder */}
        <div className="pt-2">
          <button className="flex items-center gap-2 text-sm text-primary hover:underline">
            <Tag className="h-4 w-4" />
            <span>Have a coupon code?</span>
          </button>
        </div>

        {/* Order Total */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-base font-semibold text-gray-900">
            Order Total
          </div>
          <span className="text-xl font-bold text-gray-900">
            <Currency amount={orderTotal} />
          </span>
        </div>

        {subtotal > 0 && shippingCost === 0 && (
          <div className="flex items-center justify-center gap-2 text-xs text-green-600">
            <Truck className="h-3.5 w-3.5" />
            <span>You qualify for FREE shipping!</span>
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <Button 
        disabled={itemsLength === 0 || hasStockIssues} 
        onClick={handleCheckout} 
        className='w-full mt-6 gap-2 h-12 text-base'
      >
        {hasStockIssues ? (
          'Resolve Stock Issues'
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>Proceed to Checkout</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      {hasStockIssues && (
        <p className="text-xs text-red-600 text-center mt-2">
          Update item quantities to proceed
        </p>
      )}

      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <TrustBadges variant="compact" showPaymentMethods className="justify-center" />
      </div>

      {/* Secured by Razorpay */}
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>Secured by Razorpay</span>
      </div>
    </div>
  );
};

export default Summary;
