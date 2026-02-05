'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrderSearch = () => {
  const [orderId, setOrderId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  const isValidUUID = (id: string): boolean => {
    return uuidRegex.test(id);
  };

  // Handle click outside to close the popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOrderId('');
      }
    };

    if (isOpen) {
      // Add a small delay to prevent immediate closing when opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

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
    <div className="relative" ref={containerRef}>
      {/* Search Icon Button */}
      <button
        onClick={toggleSearch}
        className="group p-2 rounded-full hover:bg-foreground/5 transition-all duration-300"
        aria-label="Track Order"
      >
        <Search className="h-[18px] w-[18px] text-foreground/70 group-hover:text-foreground transition-colors duration-300" strokeWidth={1.5} />
      </button>

      {/* Search Overlay/Modal */}
      {isOpen && (
        <>
          {/* Backdrop for Mobile */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSearch}
          />

          {/* Search Bar */}
          <div
            className={cn(
              "fixed md:absolute top-16 md:top-full right-0 md:right-0 left-0 md:left-auto z-50",
              "bg-background md:rounded-xl shadow-2xl md:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]",
              "p-5 md:p-4 md:mt-3 md:w-[380px]",
              "border border-border/50",
              "transition-all duration-300 ease-out",
              isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
            )}
          >
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium tracking-wide text-foreground">Track Your Order</h3>
                <button
                  type="button"
                  onClick={toggleSearch}
                  className="p-1.5 hover:bg-foreground/5 rounded-full transition-colors md:hidden"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={orderId}
                  onChange={handleInputChange}
                  placeholder="Enter your Order ID"
                  className={cn(
                    "w-full px-4 py-3 pr-10 rounded-lg border transition-all duration-200",
                    "bg-foreground/[0.02] text-foreground placeholder:text-muted-foreground/60",
                    "focus:outline-none focus:ring-2 focus:ring-offset-0",
                    "text-sm",
                    orderId && !isValidInput
                      ? "border-destructive/50 focus:border-destructive focus:ring-destructive/20"
                      : "border-border focus:border-foreground/30 focus:ring-foreground/10"
                  )}
                />
                {orderId && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/5 rounded-full transition-colors"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>

              {orderId && !isValidInput && (
                <p className="text-xs text-destructive flex items-center gap-1.5">
                  <span className="font-medium">Invalid Order ID format</span>
                  <span className="text-muted-foreground">• Use the ID from your order confirmation</span>
                </p>
              )}

              <button
                type="submit"
                disabled={!isValidInput}
                className={cn(
                  "w-full py-2.5 rounded-lg font-medium text-sm tracking-wide transition-all duration-300",
                  "flex items-center justify-center gap-2",
                  isValidInput
                    ? "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <Search className="h-4 w-4" />
                Track Order
              </button>

              <p className="text-xs text-muted-foreground/70 text-center">
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
