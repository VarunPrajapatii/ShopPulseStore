'use client';

import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';
import CartItem from './components/cart-item';
import Summary from './components/checkout-summary';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ShoppingBag, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import TrustBadges from '@/components/ui/trust-badges';
import MobileStickyCheckout from '@/components/ui/mobile-sticky-checkout';
import { CartSkeleton } from '@/components/ui/skeleton';

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

  // Check for stock issues (stock is in selectedVariant)
  const stockIssues = cart.items.filter(item => {
    const requestedQty = item.quantity || 1;
    return requestedQty > item.selectedVariant.stockQuantity;
  });

  const hasStockIssues = stockIssues.length > 0;

  // Calculate total items count
  const totalItemsCount = cart.items.reduce((total, item) => {
    return total + (item.quantity || 1);
  }, 0);

  // Calculate total price using variant-specific effectivePrice, with fallback
  const totalPrice = cart.items.reduce((total, item) => {
    // Use effectivePrice from cart (variant price), fallback to sellingPrice, then price
    const itemPrice = item.effectivePrice ?? item.sellingPrice ?? Number(item.price);
    return total + (itemPrice * (item.quantity || 1));
  }, 0);

  // Shipping calculation for mobile sticky
  const shippingThreshold = 499;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 49;
  const orderTotal = totalPrice + shippingCost;

  const onCheckout = () => {
    if (hasStockIssues) {
      return; // Prevent checkout if there are stock issues
    }
    router.push('/checkout');
  };

  if (!isMounted) {
    return <CartSkeleton />;
  }

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      <Container>
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8 animate-fade-in">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4 btn-arrow-slide"
            >
              <ArrowLeft className="h-4 w-4 arrow" />
              Continue Shopping
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full hover-scale">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {totalItemsCount === 0 
                      ? 'Your cart is empty' 
                      : `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'} in your cart`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Banner */}
          {cart.items.length > 0 && (
            <div className="mb-8 bg-gray-50 rounded-xl p-4 hidden sm:block animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span>Free Shipping over ₹499</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Stock Issues Warning */}
          {hasStockIssues && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Insufficient Stock for Some Items
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {stockIssues.map((item) => (
                      <li key={`${item.id}-${item.variantId}`}>
                        <strong>{item.name}</strong> (Size: {item.selectedVariant.size.name}): You requested {item.quantity || 1}, but only{' '}
                        <strong>{item.selectedVariant.stockQuantity}</strong> available.
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

          {/* Main Content - 2 Column Layout */}
          <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
            {/* Cart Items Column */}
            <div className="lg:col-span-7 animate-fade-in" style={{ animationDelay: '150ms' }}>
              {cart.items.length === 0 ? (
                <div className="text-center py-16">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 hover-scale">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
                  <Link 
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium btn-press"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <ul className="divide-y divide-gray-200">
                    {itemsWithQuantity.map((item) => (
                      <CartItem
                        key={`${item.data.id}-${item.data.variantId}`}
                        data={item.data}
                        quantity={item.quantity}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Summary Column - Only show when there are items */}
            {cart.items.length > 0 && (
              <div className="lg:col-span-5 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Summary 
                  onCheckout={onCheckout} 
                  itemsLength={totalItemsCount} 
                  totalPrice={totalPrice}
                  hasStockIssues={hasStockIssues}
                />
              </div>
            )}
          </div>

          {/* Desktop Trust Badges - Full width at bottom */}
          {cart.items.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 hidden lg:block">
              <TrustBadges 
                variant="horizontal" 
                showPaymentMethods 
                showDeliveryPartners 
              />
            </div>
          )}
        </div>
      </Container>

      {/* Mobile Sticky Checkout Bar */}
      {cart.items.length > 0 && (
        <MobileStickyCheckout
          total={orderTotal}
          onAction={onCheckout}
          actionLabel={hasStockIssues ? "Fix Stock Issues" : "Checkout"}
          disabled={hasStockIssues}
        />
      )}
    </div>
  );
};

export default CartPage;
