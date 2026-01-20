"use client";

import Currency from "@/components/ui/currency";
import TrustBadges from "@/components/ui/trust-badges";
import { Lock, Truck, Shield } from "lucide-react";

interface CheckoutItem {
  productId: string;
  variantId?: string | null;     // For variant tracking
  name: string;
  quantity: number | undefined;
  priceAtPurchase: string | number;
  sizeName?: string | null;      // Size name for display
  sizeValue?: string | null;     // Size value for display
}

interface OrderSummaryProps {
  items: CheckoutItem[];
  totalPrice: number;
  loading: boolean;
  showOtpField: boolean;
  otp: string;
  otpLoading: boolean;
  phoneNumber: string;
  onSubmit: () => void;
  onSetOtp: (value: string) => void;
  onVerifyAndPay: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalPrice,
  loading,
  showOtpField,
  otp,
  otpLoading,
  phoneNumber,
  onSubmit,
  onSetOtp,
  onVerifyAndPay,
}) => {
  // Calculate shipping
  const shippingThreshold = 499;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 49;
  const orderTotal = totalPrice + shippingCost;

  return (
    <div className="mt-16 rounded-xl bg-gray-50 border border-gray-200 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-6 lg:sticky lg:top-4">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        Order Summary
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </h2>

      {/* Items List */}
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
        {items.map((item, index) => {
          // Create unique key using productId and variantId
          const itemKey = item.variantId 
            ? `${item.productId}-${item.variantId}` 
            : `${item.productId}-${index}`;
          
          return (
            <div key={itemKey} className="flex items-center gap-3 pb-3 border-b border-border last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {/* Show size if available */}
                  {item.sizeName && (
                    <span className="text-xs text-muted-foreground">
                      Size: <span className="font-medium">{item.sizeName}</span>
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Qty: {item.quantity || 1}
                  </span>
                </div>
              </div>
              <Currency
                amount={(
                  Number(item.priceAtPurchase) * (item.quantity || 1)
                ).toString()}
                className="text-sm font-medium"
              />
            </div>
          );
        })}
      </div>

      {/* Price Breakdown */}
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <Currency amount={totalPrice.toString()} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Truck className="h-3.5 w-3.5" />
            <span>Shipping</span>
          </div>
          {shippingCost === 0 ? (
            <span className="text-green-600 font-medium text-sm">FREE</span>
          ) : (
            <Currency amount={shippingCost.toString()} />
          )}
        </div>
      </div>

      {/* Order Total */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-foreground">Total</p>
          <span className="text-xl font-bold text-foreground">
            <Currency amount={orderTotal.toString()} />
          </span>
        </div>
        {shippingCost === 0 && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Free shipping applied!
          </p>
        )}
      </div>

      {/* OTP Field - Shows after clicking Proceed to Pay */}
      {showOtpField && (
        <div className="mt-6 space-y-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Enter OTP sent to {phoneNumber}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => onSetOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              disabled={otpLoading}
              className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed bg-white text-foreground text-center text-lg tracking-widest font-mono"
            />
          </div>
          <button
            onClick={onVerifyAndPay}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {otpLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>VERIFY & PAY SECURELY</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Proceed to Pay Button - Shows initially */}
      {!showOtpField && (
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full mt-6 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>PROCEED TO PAY</span>
            </>
          )}
        </button>
      )}

      {/* Trust Indicators */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-green-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-blue-600" />
            <span>SSL Encrypted</span>
          </div>
        </div>
        
        {/* Payment Methods */}
        <TrustBadges variant="compact" showPaymentMethods className="justify-center" />
        
        {/* Razorpay Badge */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;