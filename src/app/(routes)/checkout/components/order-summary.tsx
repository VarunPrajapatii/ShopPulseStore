"use client";

import Currency from "@/components/ui/currency";

interface CheckoutItem {
  productId: string;
  name: string;
  quantity: number | undefined;
  priceAtPurchase: string;
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
    <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Order Summary
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.productId} className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-500">
                Qty: {item.quantity || 1}
              </p>
            </div>
            <Currency
              amount={(
                Number(item.priceAtPurchase) * (item.quantity || 1)
              ).toString()}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-base font-medium text-gray-900">
          <p>Order Total</p>
          <Currency amount={totalPrice.toString()} />
        </div>
      </div>

      {/* OTP Field - Shows after clicking Proceed to Pay */}
      {showOtpField && (
        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP sent to {phoneNumber}
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => onSetOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              disabled={otpLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={onVerifyAndPay}
            disabled={otpLoading || otp.length !== 6}
            className="w-full bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
          className="w-full mt-6 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "PROCEED TO PAY"}
        </button>
      )}
    </div>
  );
};

export default OrderSummary;
