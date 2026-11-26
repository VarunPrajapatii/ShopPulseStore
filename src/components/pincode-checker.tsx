'use client';

import { useState, useEffect } from 'react';
import {
  MapPin,
  Check,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import getDeliveryCharges from '@/actions/get-delivery-charges';
import useShipping, { ShippingData } from '@/hooks/use-shipping';
import { cn } from '@/lib/utils';
import { getDeliverySupportMessage } from '@/lib/checkout-messages';

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
  const { shippingData, setShippingData, setLoading, isLoading } =
    useShipping();
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

  const checkDelivery = async (pincode: string, silent = false) => {
    if (!silent && !validatePincode(pincode)) return;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await getDeliveryCharges(pincode);
      // Background refresh keeps the saved result when the provider is temporarily down.
      if (silent && !response.serviceable && response.retryable) return;

      const availabilityMetadata = {
        pincode:
          'deliveryPincode' in response ? response.deliveryPincode : pincode,
        pickupPincode:
          'pickupPincode' in response ? response.pickupPincode : null,
        totalCouriersAvailable:
          'totalCouriersAvailable' in response
            ? response.totalCouriersAvailable
            : 0,
        estimatedDays:
          'estimatedDeliveryDays' in response
            ? response.estimatedDeliveryDays
            : null,
        codAvailable: 'codAvailable' in response ? response.codAvailable : false,
        codEnabledForStore:
          'codEnabledForStore' in response
            ? response.codEnabledForStore
            : false,
        codCouriersCount:
          'codCouriersCount' in response ? response.codCouriersCount : 0,
        codChargeAmount:
          'codChargeAmount' in response ? response.codChargeAmount : null,
        allowB2BInvoices:
          'allowB2BInvoices' in response ? response.allowB2BInvoices : false,
        shipToAllowed:
          'shipToAllowed' in response ? response.shipToAllowed : null,
        stateCodes: 'stateCodes' in response ? response.stateCodes : [],
        stateNames: 'stateNames' in response ? response.stateNames : [],
      };

      if (!response.serviceable) {
        const shippingInfo: ShippingData = {
          ...availabilityMetadata,
          serviceable: false,
          errorMessage:
            response.error || 'Delivery not available to this pincode',
          errorCode: response.errorCode || 'PINCODE_NOT_SERVICEABLE',
          retryable: response.retryable ?? false,
        };
        setShippingData(shippingInfo);
        setError(response.error || 'Delivery not available to this pincode');
        onCheckComplete?.(shippingInfo);
      } else {
        const shippingInfo: ShippingData = {
          ...availabilityMetadata,
          serviceable: true,
        };
        setShippingData(shippingInfo);
        setIsEditing(false);
        onCheckComplete?.(shippingInfo);
      }
    } catch {
      if (silent) return;
      const errorMsg = 'Failed to check delivery. Please try again.';
      setError(errorMsg);
      const shippingInfo: ShippingData = {
        pincode,
        serviceable: false,
        pickupPincode: null,
        totalCouriersAvailable: 0,
        estimatedDays: null,
        codAvailable: false,
        codEnabledForStore: false,
        codCouriersCount: 0,
        codChargeAmount: null,
        allowB2BInvoices: false,
        shipToAllowed: null,
        stateCodes: [],
        stateNames: [],
        errorMessage: errorMsg,
        errorCode: 'PROVIDER_UNAVAILABLE',
        retryable: true,
      };
      setShippingData(shippingInfo);
      onCheckComplete?.(shippingInfo);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleCheckDelivery = () => checkDelivery(pincode);

  // Saved result lives in sessionStorage; re-check once per mount so courier/COD changes show up.
  useEffect(() => {
    const savedPincode = useShipping.getState().shippingData?.pincode;
    if (savedPincode) void checkDelivery(savedPincode, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const isCODAvailable =
    shippingData?.codAvailable && shippingData?.codEnabledForStore;
  const hasCurrentFailure =
    shippingData?.pincode === pincode &&
    !shippingData.serviceable &&
    !isLoading;
  const isTemporaryFailure = hasCurrentFailure && shippingData.retryable;
  const isDirectoryMiss =
    hasCurrentFailure && shippingData.errorCode === 'PINCODE_NOT_IN_DIRECTORY';
  const isShipToStateNotAllowed =
    hasCurrentFailure && shippingData.errorCode === 'SHIP_TO_STATE_NOT_ALLOWED';

  // Compact display when pincode is already set and verified
  if (!isEditing && shippingData?.pincode && shippingData.serviceable) {
    return (
      <div
        className={cn(
          'bg-muted/30 rounded-lg p-4 space-y-3',
          compact && 'p-3 space-y-2'
        )}
      >
        {/* Pincode Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Deliver to: {shippingData.pincode}
            </span>
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

        {shippingData.codEnabledForStore && (
          <p className="text-sm text-muted-foreground">
            {isCODAvailable
              ? 'Cash on Delivery available'
              : 'Cash on Delivery not available for this pincode'}
          </p>
        )}

        {shippingData.estimatedDays && (
          <p className="text-xs text-muted-foreground">
            Estimated delivery: {shippingData.estimatedDays.min}-
            {shippingData.estimatedDays.max} days
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Shipping charge is calculated at checkout based on your cart.
        </p>
      </div>
    );
  }

  // Input mode (editing or first time)
  return (
    <div
      className={cn(
        'bg-muted/30 rounded-lg p-4 space-y-3',
        compact && 'p-3 space-y-2'
      )}
    >
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
            'flex-1 px-3 py-2 text-sm border rounded-lg bg-background',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
            error &&
              'border-destructive focus:ring-destructive/20 focus:border-destructive'
          )}
          disabled={isLoading}
          maxLength={6}
        />
        <button
          onClick={handleCheckDelivery}
          disabled={isLoading || pincode.length !== 6}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'flex items-center gap-2'
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
        </button>
      </div>

      {/* Error Message */}
      {(error && !hasCurrentFailure) ||
      isDirectoryMiss ||
      isShipToStateNotAllowed ? (
        <div className="space-y-1 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              {isDirectoryMiss || isShipToStateNotAllowed
                ? shippingData?.errorMessage
                : error}
            </span>
          </div>
          {isShipToStateNotAllowed && (
            <p className="pl-6 text-xs text-muted-foreground">
              {getDeliverySupportMessage()}
            </p>
          )}
        </div>
      ) : null}

      {/* Not Serviceable Message */}
      {hasCurrentFailure &&
        !isDirectoryMiss &&
        !isShipToStateNotAllowed &&
        (isTemporaryFailure ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-3 text-amber-950">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">
                Delivery check temporarily unavailable
              </span>
            </div>
            <p className="text-xs text-amber-900/80">
              The courier service did not respond, so we cannot confirm this
              pincode yet.
            </p>
            <button
              type="button"
              onClick={handleCheckDelivery}
              className="inline-flex items-center gap-2 rounded-md border border-amber-400 bg-background px-3 py-1.5 text-xs font-medium hover:bg-amber-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry check
            </button>
          </div>
        ) : (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <X className="h-4 w-4" />
              <span className="font-medium">Delivery not available</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {shippingData.errorMessage}
            </p>
          </div>
        ))}
    </div>
  );
};

export default PincodeChecker;
