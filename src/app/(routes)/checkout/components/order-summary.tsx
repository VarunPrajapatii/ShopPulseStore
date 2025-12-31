"use client";

import PriceDisplay from "@/components/ui/price-display";
import Currency from "@/components/ui/currency";

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
  return (
    <div className="mt-16 rounded-lg bg-muted/50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Order Summary
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => {
          // Create unique key using productId and variantId
          const itemKey = item.variantId 
            ? `${item.productId}-${item.variantId}` 
            : `${item.productId}-${index}`;
          
          return (
            <div key={itemKey} className="flex items-center gap-4 pb-3 border-b border-border last:border-b-0">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.name}</p>
                {/* Show size if available */}
                {item.sizeName && (
                  <p className="text-xs text-muted-foreground">
                    Size: <span className="font-medium">{item.sizeName}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity || 1}
                </p>
              </div>
              <Currency
                amount={(
                  Number(item.priceAtPurchase) * (item.quantity || 1)
                ).toString()}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex items-center justify-between text-base font-medium text-foreground">
          <p>Order Total</p>
          <Currency amount={totalPrice.toString()} />
        </div>
      </div>

      {/* OTP Field - Shows after clicking Proceed to Pay */}
      {showOtpField && (
        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Enter OTP sent to {phoneNumber}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => onSetOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              disabled={otpLoading}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed bg-background text-foreground"
            />
          </div>
          <button
            onClick={onVerifyAndPay}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
          >
            {otpLoading ? "Verifying..." : "VERIFY AND PAY"}
          </button>
        </div>
      )}

      {/* Proceed to Pay Button - Shows initially */}
      {!showOtpField && (
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "PROCEED TO PAY"}
        </button>
      )}
    </div>
  );
};

export default OrderSummary;