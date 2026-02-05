"use client";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import TrustBadges from "@/components/ui/trust-badges";
import PincodeChecker from "@/components/pincode-checker";
import useShipping from "@/hooks/use-shipping";
import { Lock, Truck, Shield, CreditCard, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "PREPAID" | "COD";

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
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubmit: () => void;
  onSetOtp: (value: string) => void;
  onVerifyAndPay: () => void;
  onPlaceCODOrder: () => void;
  onVerifyAndPlaceCODOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  totalPrice,
  loading,
  showOtpField,
  otp,
  otpLoading,
  phoneNumber,
  paymentMethod,
  onPaymentMethodChange,
  onSubmit,
  onSetOtp,
  onVerifyAndPay,
  onPlaceCODOrder,
  onVerifyAndPlaceCODOrder,
}) => {
  const { shippingData } = useShipping();
  
  // Has pincode been checked?
  const hasPincodeChecked = !!shippingData?.pincode;
  const isServiceable = shippingData?.serviceable ?? false;
  
  // Use shipping cost from pincode check
  const shippingCost = (hasPincodeChecked && isServiceable && shippingData?.deliveryCharge) 
    ? shippingData.deliveryCharge 
    : 0;
  
  // COD charge - only applicable when COD is selected
  const codCharge = (hasPincodeChecked && isServiceable && shippingData?.codChargeAmount) 
    ? shippingData.codChargeAmount 
    : 0;
  const isCODSelected = paymentMethod === "COD";
  const appliedCODCharge = isCODSelected ? codCharge : 0;
  
  // Calculate order total
  const orderTotal = totalPrice + shippingCost + appliedCODCharge;
  
  // Check if COD is available - must be enabled for store AND available for this pincode
  const isCODAvailable = hasPincodeChecked && isServiceable && 
    shippingData?.codAvailable && shippingData?.codEnabledForStore;
  
  // Delivery is available if pincode is checked and serviceable
  const isDeliveryAvailable = hasPincodeChecked && isServiceable;

  return (
    <div className="mt-16 rounded-xl bg-gray-50 border border-gray-200 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-6 lg:sticky lg:top-20">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        Order Summary
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </h2>

      {/* Items List */}
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
        {items.map((item, index) => {
          const itemKey = item.variantId 
            ? `${item.productId}-${item.variantId}` 
            : `${item.productId}-${index}`;
          
          return (
            <div key={itemKey} className="flex items-center gap-3 pb-3 border-b border-border last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
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

      {/* Delivery Pincode Section */}
      <div className="mt-4 pt-4 border-t border-border">
        <PincodeChecker compact editable={!showOtpField} />
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
          {!hasPincodeChecked ? (
            <span className="text-muted-foreground text-xs">Enter pincode</span>
          ) : !isServiceable ? (
            <span className="text-red-600 text-xs">Not available</span>
          ) : shippingCost === 0 ? (
            <span className="text-green-600 font-medium text-sm">FREE</span>
          ) : (
            <Currency amount={shippingCost.toString()} />
          )}
        </div>
        {/* COD Charge - Only show when COD is selected and there's a charge */}
        {isCODSelected && codCharge > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Banknote className="h-3.5 w-3.5" />
              <span>COD Charge</span>
            </div>
            <Currency amount={codCharge.toString()} />
          </div>
        )}
      </div>

      {/* Order Total */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-foreground">Total</p>
          <span className="text-xl font-bold text-foreground">
            <Currency amount={orderTotal.toString()} />
          </span>
        </div>
        {isDeliveryAvailable && shippingCost === 0 && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            Free shipping applied!
          </p>
        )}
      </div>

      {/* Payment Method Selection - Only show when delivery is available and not in OTP flow */}
      {isDeliveryAvailable && !showOtpField && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
          <div className="space-y-2">
            {/* Online Payment Option */}
            <label 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                paymentMethod === "PREPAID" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="PREPAID"
                checked={paymentMethod === "PREPAID"}
                onChange={() => onPaymentMethodChange("PREPAID")}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                paymentMethod === "PREPAID" ? "border-primary" : "border-gray-300"
              )}>
                {paymentMethod === "PREPAID" && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Pay Online</p>
                <p className="text-xs text-muted-foreground">UPI, Cards, Net Banking</p>
              </div>
            </label>

            {/* COD Option */}
            <label 
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                !isCODAvailable 
                  ? "border-border bg-muted/50 cursor-not-allowed opacity-60" 
                  : paymentMethod === "COD"
                    ? "border-primary bg-primary/5 cursor-pointer" 
                    : "border-border hover:border-gray-300 cursor-pointer"
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => isCODAvailable && onPaymentMethodChange("COD")}
                disabled={!isCODAvailable}
                className="sr-only"
              />
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                paymentMethod === "COD" ? "border-primary" : "border-gray-300"
              )}>
                {paymentMethod === "COD" && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
              <Banknote className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">
                  {isCODAvailable ? "Pay when you receive" : "Not available for this pincode"}
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* OTP Field - Shows after clicking Proceed to Pay or Place COD Order */}
      {showOtpField && (
        <div className="mt-6 space-y-3">
          <div className={cn(
            "rounded-lg p-3",
            paymentMethod === "COD" ? "bg-green-50" : "bg-blue-50"
          )}>
            <label className={cn(
              "block text-sm font-medium mb-2",
              paymentMethod === "COD" ? "text-green-900" : "text-blue-900"
            )}>
              Enter OTP sent to {phoneNumber}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => onSetOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              disabled={otpLoading}
              className={cn(
                "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed bg-white text-foreground text-center text-lg tracking-widest font-mono",
                paymentMethod === "COD" ? "border-green-200" : "border-blue-200"
              )}
            />
          </div>
          <Button
            onClick={paymentMethod === "COD" ? onVerifyAndPlaceCODOrder : onVerifyAndPay}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {otpLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Verifying...</span>
              </>
            ) : paymentMethod === "COD" ? (
              <>
                <Banknote className="h-4 w-4" />
                <span>VERIFY & PLACE ORDER</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>VERIFY & PAY SECURELY</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      {!showOtpField && (
        <>
          {paymentMethod === "COD" ? (
            <Button
              onClick={onPlaceCODOrder}
              disabled={loading || !isDeliveryAvailable}
              className="w-full mt-6 bg-primary text-primary-foreground px-6 py-3.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4" />
                  <span>PLACE ORDER (Pay ₹{orderTotal} on Delivery)</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={onSubmit}
              disabled={loading || !isDeliveryAvailable}
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
            </Button>
          )}
        </>
      )}

      {!isDeliveryAvailable && (
        <p className="text-xs text-amber-600 text-center mt-2">
          Please enter a valid pincode to continue
        </p>
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
        
        <TrustBadges variant="compact" showPaymentMethods className="justify-center" />
        
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;