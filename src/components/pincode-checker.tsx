'use client';

import { useState, useEffect } from 'react';
import { MapPin, Truck, Check, X, Loader2, AlertCircle, Banknote } from 'lucide-react';
import getDeliveryCharges from '@/actions/get-delivery-charges';
import useShipping, { ShippingData } from '@/hooks/use-shipping';
import Currency from '@/components/ui/currency';
import { cn } from '@/lib/utils';

interface PincodeCheckerProps {
  /** Whether to show in compact mode (for cart) */
  compact?: boolean;
  /** Callback when pincode check completes */
  onCheckComplete?: (data: ShippingData) => void;
  /** Whether user can change pincode (false in checkout after initial entry) */
  editable?: boolean;
}

const PincodeChecker: React.FC<PincodeCheckerProps> = ({
  compact = false,
  onCheckComplete,
  editable = true,
}) => {
  const { shippingData, setShippingData, setLoading, isLoading } = useShipping();
  const [pincode, setPincode] = useState(shippingData?.pincode || '');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(!shippingData?.pincode);

  // Sync pincode from store when component mounts
  useEffect(() => {
    if (shippingData?.pincode) {
      setPincode(shippingData.pincode);
      setIsEditing(false);
    }
  }, [shippingData?.pincode]);

  const validatePincode = (value: string): boolean => {
    if (!value || value.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!/^\d{6}$/.test(value)) {
      setError('Pincode must contain only digits');
      return false;
    }
    setError(null);
    return true;
  };

  const handleCheckDelivery = async () => {
    if (!validatePincode(pincode)) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getDeliveryCharges(pincode);

      if (!response.serviceable) {
        const shippingInfo: ShippingData = {
          pincode,
          serviceable: false,
          deliveryCharge: null,
          estimatedDays: null,
          codAvailable: false,
          codEnabledForStore: false,
          codChargeAmount: null,
          errorMessage: response.error || 'Delivery not available to this pincode',
        };
        setShippingData(shippingInfo);
        setError(response.error || 'Delivery not available to this pincode');
        onCheckComplete?.(shippingInfo);
      } else {
        const shippingInfo: ShippingData = {
          pincode,
          serviceable: true,
          deliveryCharge: response.deliveryCharge,
          estimatedDays: response.estimatedDeliveryDays,
          codAvailable: response.codAvailable,
          codEnabledForStore: response.codEnabledForStore,
          codChargeAmount: response.codChargeAmount,
        };
        setShippingData(shippingInfo);
        setIsEditing(false);
        onCheckComplete?.(shippingInfo);
      }
    } catch {
      const errorMsg = 'Failed to check delivery. Please try again.';
      setError(errorMsg);
      const shippingInfo: ShippingData = {
        pincode,
        serviceable: false,
        deliveryCharge: null,
        estimatedDays: null,
        codAvailable: false,
        codEnabledForStore: false,
        codChargeAmount: null,
        errorMessage: errorMsg,
      };
      setShippingData(shippingInfo);
      onCheckComplete?.(shippingInfo);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePincode = () => {
    if (editable) {
      setIsEditing(true);
      setError(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCheckDelivery();
    }
  };

  // COD is only available when both codAvailable AND codEnabledForStore are true
  const isCODAvailable = shippingData?.codAvailable && shippingData?.codEnabledForStore;

  // Compact display when pincode is already set and verified
  if (!isEditing && shippingData?.pincode && shippingData.serviceable) {
    return (
      <div className={cn(
        "bg-muted/30 rounded-lg p-4 space-y-3",
        compact && "p-3 space-y-2"
      )}>
        {/* Pincode Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Deliver to: {shippingData.pincode}</span>
          </div>
          {editable && (
            <button
              onClick={handleChangePincode}
              className="text-sm text-primary hover:underline font-medium"
            >
              Change
            </button>
          )}
        </div>

        {/* Delivery Info */}
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          <span>Delivery available</span>
        </div>

        {/* Shipping Cost */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span>Shipping</span>
          </div>
          <span className="font-medium">
            {shippingData.deliveryCharge && shippingData.deliveryCharge > 0 ? (
              <Currency amount={shippingData.deliveryCharge.toString()} />
            ) : (
              <span className="text-green-600">FREE</span>
            )}
          </span>
        </div>

        {/* COD Availability - only show when codEnabledForStore is true */}
        {shippingData.codEnabledForStore && (
          isCODAvailable ? (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="h-4 w-4 text-green-600" />
                <span>Cash on Delivery available</span>
              </div>
              {shippingData.codChargeAmount && shippingData.codChargeAmount > 0 && (
                <span className="text-xs text-muted-foreground">+₹{shippingData.codChargeAmount}</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <X className="h-4 w-4 text-amber-500" />
              <span>Cash on Delivery not available for this pincode</span>
            </div>
          )
        )}

        {/* Estimated Delivery */}
        {shippingData.estimatedDays && (
          <p className="text-xs text-muted-foreground">
            Estimated delivery: {shippingData.estimatedDays.min}-{shippingData.estimatedDays.max} days
          </p>
        )}
      </div>
    );
  }

  // Input mode (editing or first time)
  return (
    <div className={cn(
      "bg-muted/30 rounded-lg p-4 space-y-3",
      compact && "p-3 space-y-2"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Check Delivery Availability</span>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={pincode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setPincode(value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter pincode"
          className={cn(
            "flex-1 px-3 py-2 text-sm border rounded-lg bg-background",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            error && "border-destructive focus:ring-destructive/20 focus:border-destructive"
          )}
          disabled={isLoading}
          maxLength={6}
        />
        <button
          onClick={handleCheckDelivery}
          disabled={isLoading || pincode.length !== 6}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Check'
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Not Serviceable Message */}
      {shippingData?.pincode === pincode && !shippingData?.serviceable && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <X className="h-4 w-4" />
            <span className="font-medium">Delivery not available</span>
          </div>
          <p className="text-xs text-muted-foreground">
            We don&apos;t deliver to this pincode yet. Please contact us at{' '}
            <a 
              href={`mailto:${process.env.NEXT_PUBLIC_SERVICE_EMAIL || 'support@example.com'}`}
              className="text-primary hover:underline"
            >
              {process.env.NEXT_PUBLIC_SERVICE_EMAIL || 'support@example.com'}
            </a>
            {' '}for special delivery requests.
          </p>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
