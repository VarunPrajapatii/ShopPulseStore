'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrderSearch = () => {
  const [orderId, setOrderId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const isValidUUID = (id: string): boolean => {
    return uuidRegex.test(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim() && isValidUUID(orderId.trim())) {
      router.push(`/order-success?orderId=${orderId.trim()}`);
      setOrderId('');
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(e.target.value);
  };

  const handleClear = () => {
    setOrderId('');
  };

  const toggleSearch = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setOrderId('');
    }
  };

  const isValidInput = orderId.trim() && isValidUUID(orderId.trim());

  return (
    <div className="relative">
      {/* Search Icon Button */}
      <button
        onClick={toggleSearch}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Track Order"
      >
        <Search className="h-5 w-5 text-gray-600" />
      </button>

      {/* Search Overlay/Modal for Mobile */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={toggleSearch}
          />

          {/* Search Bar */}
          <div
            className={cn(
              "fixed md:absolute top-16 md:top-full right-0 md:right-0 left-0 md:left-auto z-50",
              "bg-white md:rounded-lg shadow-2xl md:shadow-xl",
              "p-4 md:p-3 md:mt-2 md:w-[400px]",
              "transition-all duration-300 ease-out",
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            )}
          >
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">Track Your Order</h3>
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors md:hidden"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={orderId}
                  onChange={handleInputChange}
                  placeholder="Enter your Order ID"
                  className={cn(
                    "w-full px-4 py-2.5 pr-10 rounded-lg border-2 transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-offset-1",
                    orderId && !isValidInput
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  )}
                />
                {orderId && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>

              {orderId && !isValidInput && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="font-medium">Invalid Order ID format</span>
                  <span className="text-gray-500">• Use the ID from your order confirmation</span>
                </p>
              )}

              <button
                type="submit"
                disabled={!isValidInput}
                className={cn(
                  "w-full py-2.5 rounded-lg font-medium transition-all",
                  "flex items-center justify-center gap-2",
                  isValidInput
                    ? "bg-black text-white hover:bg-gray-800 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                <Search className="h-4 w-4" />
                Track Order
              </button>

              <p className="text-xs text-gray-500 text-center">
                Find your Order ID in the confirmation email
              </p>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderSearch;
