'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Container from '@/components/ui/container';
import useCart, { PENDING_CART_CLEAR_PREFIX } from '@/hooks/use-cart';
import useShipping from '@/hooks/use-shipping';
import toast from 'react-hot-toast';
import { formSchema, CheckoutFormValues } from '@/lib/zodSchema';
import { AddressForm, OrderSummary, type PaymentMethod } from './components';
import B2bForm from './components/b2b-form';
import type { BuyerBlock } from '@/lib/returns-types';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import getProduct from '@/actions/get-product';
import Link from 'next/link';
import Script from 'next/script';
import CheckoutProgress from '@/components/ui/checkout-progress';
import TrustBadges from '@/components/ui/trust-badges';
import MobileStickyCheckout from '@/components/ui/mobile-sticky-checkout';
import { CheckoutSkeleton } from '@/components/ui/skeleton';
import CheckoutProcessingOverlay from '@/components/ui/checkout-processing-overlay';
import useCheckoutQuote from '@/hooks/use-checkout-quote';
import type { CheckoutQuote } from '@/actions/get-checkout-quote';
import { useStoreBrand } from '@/providers/store-brand-provider';
import {
  B2B_NOT_AVAILABLE_MESSAGE,
  BUSINESS_BILLING_ADDRESS_REQUIRED_MESSAGE,
  BUSINESS_NAME_REQUIRED_MESSAGE,
  COMPLETE_BUSINESS_INVOICE_DETAILS_MESSAGE,
  getBuyerFriendlyCheckoutMessage,
  INVALID_BUSINESS_INVOICE_FORM_MESSAGE,
} from '@/lib/checkout-messages';
import {
  CheckoutOtpError,
  normalizeIndianPhone,
  requestCheckoutOtp,
  verifyCheckoutOtp,
} from '@/lib/checkout-otp-api';

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    email?: string;
    contact?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
  timeout?: number;
  theme?: {
    color?: string;
  };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (
    event: 'payment.failed',
    callback: (response: { error?: { description?: string } }) => void
  ) => void;
}

type CheckoutStep = 'address' | 'verification' | 'payment' | 'done';

type CheckoutPhase = 'idle' | 'paying' | 'verifying' | 'redirecting';

function checkoutBuyer(buyer: BuyerBlock): Omit<BuyerBlock, 'pan'> {
  return {
    gstin: buyer.gstin,
    legalName: buyer.legalName,
    billingAddress: {
      line1: buyer.billingAddress.line1,
      line2: buyer.billingAddress.line2,
      city: buyer.billingAddress.city,
      state: buyer.billingAddress.state,
      pincode: buyer.billingAddress.pincode,
      country: buyer.billingAddress.country,
    },
  };
}

// Verify call ko network blips se bachane ke liye retry.
// 4xx (server ne explicitly reject kiya) pe retry nahi hota.
// NOTE: backend /checkout/verify idempotent hona chahiye (settlement atomic hai to ok).
const verifyWithRetry = async (razorpayResponse: RazorpayResponse) => {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout/verify`,
        {
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        }
      );
    } catch (error) {
      const isClientRejection =
        axios.isAxiosError(error) &&
        !!error.response &&
        error.response.status < 500;
      if (isClientRejection || attempt === maxAttempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  throw new Error('Verification failed');
};

const CheckoutPage = () => {
  const { name: storeName } = useStoreBrand();
  const cart = useCart();
  const items = cart.items;
  const router = useRouter();
  const { shippingData, clearShippingData } = useShipping();
  const [orderNotes, setOrderNotes] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PREPAID');

  // Set mounted state for hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cart stock is a snapshot from add-to-cart time; fetch live stock once on open
  const [liveStock, setLiveStock] = useState<
    Record<string, { stock: number; lowThreshold: number }>
  >({});
  useEffect(() => {
    const productIds = [...new Set(useCart.getState().items.map((i) => i.id))];
    if (productIds.length === 0) return;
    let cancelled = false;
    void Promise.all(productIds.map((id) => getProduct(id))).then(
      (products) => {
        if (cancelled) return;
        const next: Record<string, { stock: number; lowThreshold: number }> =
          {};
        for (const product of products) {
          for (const variant of product?.variants ?? []) {
            next[`${product!.id}:${variant.id}`] = {
              stock: variant.stockQuantity,
              lowThreshold: variant.lowStockThreshold,
            };
          }
        }
        setLiveStock(next);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const stockNotices = items.flatMap((item) => {
    const live = liveStock[`${item.id}:${item.variantId}`];
    if (!live) return [];
    const qty = item.quantity || 1;
    const label =
      item.selectedVariant.size.name !== 'Default'
        ? `${item.name} (${item.selectedVariant.size.name})`
        : item.name;
    if (live.stock <= 0) {
      return [
        {
          key: item.variantId,
          error: true,
          text: `${label} is out of stock. Please remove it from your cart.`,
        },
      ];
    }
    if (qty > live.stock) {
      return [
        {
          key: item.variantId,
          error: true,
          text: `Only ${live.stock} left of ${label}, but your cart has ${qty}. Please reduce the quantity.`,
        },
      ];
    }
    if (live.stock <= live.lowThreshold) {
      return [
        {
          key: item.variantId,
          error: false,
          text: `Hurry, only ${live.stock} left of ${label}.`,
        },
      ];
    }
    return [];
  });

  // Items for display in order summary (with name and size from variant)
  // Use variant-specific pricing (effectivePrice from cart)
  const displayItems = items.map((item) => ({
    productId: item.id,
    variantId: item.variantId,
    name: item.name,
    quantity: item.quantity || 1,
    // Use effectivePrice (variant price) from cart, with fallbacks
    priceAtPurchase:
      item.effectivePrice ?? item.sellingPrice ?? Number(item.price),
    // Only include size info for variant products (not "Default")
    sizeName:
      item.selectedVariant.size.name !== 'Default'
        ? item.selectedVariant.size.name
        : null,
    sizeValue:
      item.selectedVariant.size.name !== 'Default'
        ? item.selectedVariant.size.value
        : null,
  }));

  // Items for backend API (with variantId for variant tracking)
  // Note: priceAtPurchase must be a string per API spec, uses variant-specific pricing
  const checkoutItems = items.map((item) => ({
    productId: item.id,
    // Only send variantId for actual variant products
    variantId:
      item.selectedVariant.size.name !== 'Default' ? item.variantId : null,
    name: item.name,
    quantity: item.quantity || 1,
    // Use effectivePrice (variant price) from cart, with fallbacks
    priceAtPurchase: String(
      item.effectivePrice ?? item.sellingPrice ?? Number(item.price)
    ),
    // Only send size for variant products
    size:
      item.selectedVariant.size.name !== 'Default'
        ? item.selectedVariant.sizeId
        : null,
  }));

  const [b2bEnabled, setB2bEnabled] = useState(false);
  const [buyer, setBuyer] = useState<BuyerBlock | null>(null);
  const [b2bServerError, setB2bServerError] = useState<
    'INVALID_GSTIN' | 'MISSING_LEGAL_NAME' | 'MISSING_B2B_ADDRESS' | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const checkoutInFlightRef = useRef(false);
  const [otpPhone, setOtpPhone] = useState(''); // 10-digit number the OTP was sent to
  const [otpMasked, setOtpMasked] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState<number | null>(null);
  const [checkoutAuth, setCheckoutAuth] = useState<{
    token: string;
    phone: string;
    expiresAt: number;
  } | null>(null);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const t = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCooldown]);

  const resetOtpState = () => {
    setShowOtpField(false);
    setOtp('');
    setOtpPhone('');
    setOtpMasked('');
    setOtpCooldown(0);
    setOtpAttemptsLeft(null);
    setCheckoutAuth(null);
  };

  // Sends (or resends) the checkout OTP. Returns true when the OTP step should be shown.
  const sendCheckoutOtp = async (rawPhone: string): Promise<boolean> => {
    const phone10 = normalizeIndianPhone(rawPhone);
    try {
      const res = await requestCheckoutOtp(phone10);
      setOtpPhone(phone10);
      setOtpMasked(res.masked);
      setOtpCooldown(res.cooldownSeconds ?? 30);
      setOtpAttemptsLeft(null);
      setCheckoutAuth(null);
      setOtp('');
      setShowOtpField(true);
      toast.success(`OTP sent to ${res.masked}`);
      return true;
    } catch (error) {
      if (error instanceof CheckoutOtpError) {
        if (error.code === 'COOLDOWN_ACTIVE') {
          // A code was just sent; let the user enter it.
          setOtpPhone(phone10);
          setOtpMasked(`••••••${phone10.slice(-4)}`);
          setOtpCooldown(error.cooldownSeconds ?? 30);
          setShowOtpField(true);
          toast('An OTP was sent a moment ago. Please enter that code.');
          return true;
        }
        const messages: Record<string, string> = {
          INVALID_PHONE: 'Enter a valid 10-digit mobile number.',
          RATE_LIMITED: 'Too many OTP requests. Please try again later.',
          SEND_FAILED: 'We could not send the OTP. Please try again.',
        };
        toast.error(
          messages[error.code] ?? 'Failed to send OTP. Please try again.'
        );
      } else {
        toast.error('Failed to send OTP. Please try again.');
      }
      return false;
    }
  };

  const [phase, setPhase] = useState<CheckoutPhase>('idle');
  // Ref isliye: cart clear hone wale render mein bhi overlay guaranteed rahe,
  // state update ke batching pe depend na karna pade.
  const finalizingRef = useRef(false);
  const isFinalizing =
    phase === 'verifying' || phase === 'redirecting' || finalizingRef.current;

  // Step ab derived hai, extra render wala effect nahi chahiye
  const currentStep: CheckoutStep =
    phase === 'redirecting'
      ? 'done'
      : phase === 'paying' || phase === 'verifying'
        ? 'payment'
        : showOtpField
          ? 'verification'
          : 'address';

  // Success page ka JS pehle se load rakho, navigation instant lagega
  useEffect(() => {
    router.prefetch('/order-success');
  }, [router]);

  // Order complete: pehle overlay ON, phir cart clear, phir navigate
  const finalizeOrder = (
    orderId: string,
    cartId: string,
    cartRevision: number
  ) => {
    finalizingRef.current = true;
    setPhase('redirecting');
    cart.completeOrder(
      orderId,
      cartId,
      cartRevision,
      items.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        quantity: item.quantity || 1,
      }))
    );
    clearShippingData();
    // replace => Back dabane pe user checkout pe wapas nahi aayega
    router.replace(`/order-success?orderId=${encodeURIComponent(orderId)}`);
  };

  // Known checkout error codes from the backend. Returns true when handled.
  const handleCheckoutErrorCode = (
    errorData: unknown,
    cartId: string,
    cartRevision: number
  ): boolean => {
    if (!errorData || typeof errorData !== 'object') return false;
    const { code, orderId, message, details } = errorData as {
      code?: string;
      orderId?: string;
      message?: string;
      details?: Record<string, unknown> & { quote?: CheckoutQuote };
    };

    if (code === 'OTP_REQUIRED') {
      resetOtpState();
      toast.error('Phone verification expired. Please verify again.');
      return true;
    }

    if (code === 'QUOTE_CHANGED') {
      if (details?.quote) replaceQuote(details.quote);
      toast.error(getBuyerFriendlyCheckoutMessage(code, message, details));
      return true;
    }
    if (code === 'QUOTE_TOKEN_REQUIRED') {
      toast.error(getBuyerFriendlyCheckoutMessage(code, message, details));
      return true;
    }
    if (code === 'B2B_STATE_MISMATCH' || code === 'B2B_NOT_AVAILABLE') {
      setB2bEnabled(false);
      setBuyer(null);
      toast.error(
        getBuyerFriendlyCheckoutMessage(
          code,
          message,
          details,
          B2B_NOT_AVAILABLE_MESSAGE
        )
      );
      return true;
    }
    if (code === 'INVALID_GSTIN') {
      setB2bServerError('INVALID_GSTIN');
      toast.error(getBuyerFriendlyCheckoutMessage(code, message, details));
      return true;
    }
    if (code === 'B2B_DETAILS_MISSING') {
      setB2bServerError('MISSING_B2B_ADDRESS');
      toast.error(getBuyerFriendlyCheckoutMessage(code, message, details));
      return true;
    }
    if (
      code === 'SHIP_TO_STATE_NOT_ALLOWED' ||
      code === 'PINCODE_STATE_MISMATCH' ||
      code === 'PLACE_OF_SUPPLY_UNRESOLVED' ||
      code === 'TAX_IDENTITY_MISSING' ||
      code === 'TAX_NOT_READY' ||
      code === 'TAX_NOT_SELLABLE'
    ) {
      toast.error(getBuyerFriendlyCheckoutMessage(code, message, details));
      return true;
    }

    if (code === 'CHECKOUT_ALREADY_COMPLETED' && orderId) {
      finalizeOrder(orderId, cartId, cartRevision);
      return true;
    }
    if (code === 'PREVIOUS_PAYMENT_PENDING' && orderId) {
      // Cart stays as is; the success page polls the earlier order.
      toast('Your earlier payment is being confirmed');
      router.replace(`/order-success?orderId=${encodeURIComponent(orderId)}`);
      return true;
    }
    if (code === 'CHECKOUT_TEMPORARILY_UNAVAILABLE') {
      toast.error(
        'We could not complete your request right now. Please try again in a moment.'
      );
      return true;
    }
    return false;
  };

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      shippingAddress: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      isShippingSameAsBilling: true,
      billingAddress: {
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'IN',
      },
    },
  });

  const totalPrice = items.reduce((total, item) => {
    // Use effectivePrice (variant-specific price) from cart, with fallbacks
    const itemPrice =
      item.effectivePrice ?? item.sellingPrice ?? Number(item.price);
    return total + itemPrice * (item.quantity || 1);
  }, 0);

  // Check if pincode has been checked
  const hasPincodeChecked = !!shippingData?.pincode;
  const isServiceable = shippingData?.serviceable ?? false;
  const allowB2BInvoices = shippingData?.allowB2BInvoices === true;

  useEffect(() => {
    if (!allowB2BInvoices) {
      setB2bEnabled(false);
      setBuyer(null);
      setB2bServerError(null);
    }
  }, [allowB2BInvoices]);

  // Calculate shipping cost from pincode check
  const shippingCost =
    hasPincodeChecked && isServiceable
      ? (shippingData?.deliveryCharge ?? 0)
      : 0;

  // The backend quote is the only source of amounts once a pincode and State are known.
  const shippingStateText = form.watch('shippingAddress.state');
  const billingStateText = form.watch('isShippingSameAsBilling')
    ? null
    : form.watch('billingAddress.state') || null;
  const quoteState = shippingStateText || null;
  const b2bBuyerReady = !b2bEnabled || buyer !== null;

  // One State: fill it. Several States: the buyer must choose, never auto-pick.
  const pincodeStateNames = shippingData?.stateNames;
  useEffect(() => {
    if (!pincodeStateNames || pincodeStateNames.length === 0) return;
    const current = form.getValues('shippingAddress.state');
    if (pincodeStateNames.includes(current)) return;
    form.setValue(
      'shippingAddress.state',
      pincodeStateNames.length === 1 ? pincodeStateNames[0] : '',
      { shouldValidate: pincodeStateNames.length === 1 }
    );
  }, [pincodeStateNames, form]);

  const {
    quote,
    failure: quoteFailure,
    loading: quoteLoading,
    replaceQuote,
  } = useCheckoutQuote({
    enabled: isMounted && hasPincodeChecked && isServiceable && b2bBuyerReady,
    items: items.map((item) => ({
      productId: item.id,
      variantId:
        item.selectedVariant.size.name !== 'Default' ? item.variantId : null,
      quantity: item.quantity || 1,
    })),
    pincode: shippingData?.pincode,
    state: quoteState,
    paymentMethod,
    buyer: b2bEnabled && buyer ? checkoutBuyer(buyer) : null,
    billingState: billingStateText,
  });
  const quoteReady =
    b2bBuyerReady &&
    !!quote &&
    !quoteLoading &&
    quote.paymentMethod === paymentMethod;

  // Total the buyer pays: the quote when ready, else goods + shipping.
  const orderTotal = quoteReady
    ? Number(quote.total)
    : totalPrice + shippingCost;

  // Returns a valid checkout auth token, verifying the typed OTP if needed.
  // The token is cached, so a Razorpay cancel + retry does not need the (already used) OTP again.
  const ensureCheckoutAuth = async (): Promise<string | null> => {
    const currentPhone = normalizeIndianPhone(form.getValues('phone'));
    if (!otpPhone || otpPhone !== currentPhone) {
      toast.error('Phone number changed. Please request a new OTP.');
      resetOtpState();
      return null;
    }

    if (
      checkoutAuth &&
      checkoutAuth.phone === otpPhone &&
      checkoutAuth.expiresAt > Date.now() + 30_000
    ) {
      return checkoutAuth.token;
    }

    try {
      const res = await verifyCheckoutOtp(otpPhone, otp);
      setCheckoutAuth({
        token: res.checkoutAuthToken,
        phone: otpPhone,
        expiresAt: new Date(res.expiresAt).getTime(),
      });
      return res.checkoutAuthToken;
    } catch (error) {
      if (error instanceof CheckoutOtpError) {
        if (typeof error.attemptsLeft === 'number') {
          setOtpAttemptsLeft(error.attemptsLeft);
        }
        toast.error(
          error.code === 'LOCKED'
            ? 'Too many wrong attempts. Please request a new OTP.'
            : error.code === 'INVALID_OR_EXPIRED'
              ? 'Invalid or expired OTP. Please try again.'
              : 'Could not verify OTP. Please try again.'
        );
      } else {
        toast.error('Could not verify OTP. Please try again.');
      }
      setOtp('');
      return null;
    }
  };

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!b2bBuyerReady) {
      toast.error(COMPLETE_BUSINESS_INVOICE_DETAILS_MESSAGE);
      return;
    }
    setLoading(true);
    try {
      await sendCheckoutOtp(data.phone);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndPay = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    if (checkoutInFlightRef.current) return;

    checkoutInFlightRef.current = true;
    setOtpLoading(true);
    const checkoutCartId = cart.cartId;
    const checkoutCartRevision = cart.cartRevision;
    try {
      const authToken = await ensureCheckoutAuth();
      if (!authToken) return;

      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        return;
      }

      if (!quoteReady || !quote) {
        toast.error('Please wait while we confirm your order total.');
        return;
      }

      // Get form values
      const formData = form.getValues();
      const isShippingSameAsBilling = formData.isShippingSameAsBilling;

      // Build the checkout payload with structured addresses
      const payload: {
        name: string;
        email: string;
        phone: string;
        shippingAddress: {
          line1: string;
          line2?: string;
          city: string;
          state: string;
          pincode: string;
          country?: string;
        };
        billingAddress?: {
          name?: string;
          phone?: string;
          line1: string;
          line2?: string;
          city: string;
          state: string;
          pincode: string;
          country?: string;
        };
        isShippingSameAsBilling: boolean;
        notes?: string;
        items: typeof checkoutItems;
        paymentMethod: 'PREPAID';
        buyer?: BuyerBlock;
        quoteToken: string;
      } = {
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        shippingAddress: {
          line1: formData.shippingAddress.line1,
          line2: formData.shippingAddress.line2 || undefined,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          pincode: formData.shippingAddress.pincode,
          country: formData.shippingAddress.country || 'India',
        },
        isShippingSameAsBilling,
        items: checkoutItems,
        paymentMethod: 'PREPAID',
        buyer: b2bEnabled && buyer ? checkoutBuyer(buyer) : undefined,
        quoteToken: quote.quoteToken,
      };

      // Add order notes if provided
      if (orderNotes.trim()) {
        payload.notes = orderNotes.trim();
      }

      // Only include billing address when different from shipping
      if (!isShippingSameAsBilling && formData.billingAddress) {
        payload.billingAddress = {
          name: formData.billingAddress.name || undefined,
          phone: formData.billingAddress.phone || undefined,
          line1: formData.billingAddress.line1,
          line2: formData.billingAddress.line2 || undefined,
          city: formData.billingAddress.city,
          state: formData.billingAddress.state,
          pincode: formData.billingAddress.pincode,
          country: formData.billingAddress.country || 'IN',
        };
      }

      const idempotencyKey = `${checkoutCartId}:${checkoutCartRevision}`;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout`,

        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
            'X-Checkout-Auth': authToken,
          },
        }
      );

      if (response.status === 202) {
        toast('This checkout is already being processed in another tab.');
        return;
      }
      const {
        razorpayOrderId,
        razorpayKeyId,
        amount,
        email,
        phone,
        orderId,
        paymentExpiresAt,
      } = response.data;
      if (!razorpayKeyId) {
        throw new Error('Payment gateway key was not returned by checkout.');
      }

      // Close Checkout a minute before the unpaid hold ends on the server.
      let checkoutTimeoutSeconds: number | undefined;
      if (paymentExpiresAt) {
        const secondsLeft =
          Math.floor(
            (new Date(paymentExpiresAt).getTime() - Date.now()) / 1000
          ) - 60;
        if (Number.isFinite(secondsLeft)) {
          if (secondsLeft < 1) {
            setPhase('idle');
            toast('Payment session expired, please try again');
            return;
          }
          checkoutTimeoutSeconds = secondsLeft;
        }
      }
      const checkoutDeadline = checkoutTimeoutSeconds
        ? Date.now() + checkoutTimeoutSeconds * 1000
        : null;

      // Handler fire hone ke baad ondismiss ko ignore karne ke liye
      let paymentStarted = false;

      const options: RazorpayOptions = {
        key: razorpayKeyId,
        amount: Math.round(amount * 100), // float errors se bachao
        currency: 'INR',
        name: storeName,
        description: 'Order Payment',
        order_id: razorpayOrderId,
        prefill: {
          email: email,
          contact: phone,
        },
        handler: async function (razorpayResponse: RazorpayResponse) {
          paymentStarted = true;
          setPhase('verifying'); // overlay turant ON

          try {
            const verifyResponse = await verifyWithRetry(razorpayResponse);
            if (verifyResponse.data.success) {
              finalizeOrder(orderId, checkoutCartId, checkoutCartRevision);
              return;
            }
            throw new Error('Verification not confirmed');
          } catch (error) {
            const rejectedByServer =
              axios.isAxiosError(error) &&
              !!error.response &&
              error.response.status < 500;

            if (rejectedByServer) {
              toast.error(
                'Payment could not be verified. If money was deducted, please contact support with your Order ID.'
              );
              setPhase('idle');
              return;
            }

            // Network/5xx: paisa kat chuka ho sakta hai. Error mat dikhao,
            // order-success page status poll karega (webhook safety net hai).
            toast('We are confirming your payment. Please wait…');
            // Success page clears these lines once it sees the payment confirmed
            try {
              sessionStorage.setItem(
                `${PENDING_CART_CLEAR_PREFIX}${orderId}`,
                JSON.stringify({
                  cartId: checkoutCartId,
                  cartRevision: checkoutCartRevision,
                  lines: items.map((item) => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: item.quantity || 1,
                  })),
                })
              );
            } catch {
              // Storage unavailable: re-submitting the same cart still finalizes it
            }
            finalizingRef.current = true;
            setPhase('redirecting');
            router.replace(
              `/order-success?orderId=${encodeURIComponent(orderId)}`
            );
          }
        },
        modal: {
          ondismiss: function () {
            if (paymentStarted) return;
            setPhase('idle');
            // Checkout closes itself when its timeout elapses
            const timedOut =
              checkoutDeadline !== null &&
              Date.now() >= checkoutDeadline - 2000;
            toast(
              timedOut
                ? 'Payment session expired, please try again'
                : 'Payment cancelled. You can try again whenever you are ready.'
            );
          },
        },
        timeout: checkoutTimeoutSeconds,
        theme: {
          color: '#000000',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (failure) => {
        toast.error(
          failure.error?.description || 'Payment failed. Please try again.'
        );
      });
      setPhase('paying');
      razorpay.open();
      // NOTE: yahan setShowOtpField(false) / setOtp('') jaan-boojh ke nahi hai.
      // Cancel karne par user OTP step pe hi rahega aur "Verify & Pay" dobara dabake retry karega.
    } catch (error) {
      setPhase('idle');
      console.error('Error verifying OTP:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        const errorData = error.response.data;

        if (
          handleCheckoutErrorCode(
            errorData,
            checkoutCartId,
            checkoutCartRevision
          )
        ) {
          return;
        }

        // Handle insufficient stock error
        if (
          typeof errorData === 'string' &&
          errorData.includes('Insufficient stock')
        ) {
          // Extract product name and stock info from error message
          const stockMatch = errorData.match(
            /Insufficient stock for (.+)\. Available: (\d+), Requested: (\d+)/
          );
          if (stockMatch) {
            const [, productName, available, requested] = stockMatch;
            toast.error(
              `Sorry, we don't have enough stock for "${productName}". Only ${available} available, but you requested ${requested}. Please update your cart.`,
              { duration: 6000 }
            );
          } else {
            toast.error(errorData, { duration: 5000 });
          }
        } else if (errorData.error === 'Some products are not available') {
          toast.error(
            'Some products in your cart are no longer available. Please refresh and try again.'
          );
        } else {
          const errorMessage =
            errorData.error || errorData || 'Failed to process checkout';
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to verify OTP. Please try again.');
      }
    } finally {
      checkoutInFlightRef.current = false;
      setOtpLoading(false);
    }
  };

  // Handle COD order - Step 1: Validate and send OTP
  const handlePlaceCODOrder = async () => {
    if (!b2bBuyerReady) {
      toast.error(COMPLETE_BUSINESS_INVOICE_DETAILS_MESSAGE);
      return;
    }
    // Trigger form validation first
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if delivery is serviceable
    if (!hasPincodeChecked || !isServiceable) {
      toast.error('Please enter a valid delivery pincode');
      return;
    }

    // Check if COD is available (must be enabled for store AND available for this pincode)
    if (!shippingData?.codAvailable || !shippingData?.codEnabledForStore) {
      toast.error('Cash on Delivery is not available for this pincode');
      setPaymentMethod('PREPAID');
      return;
    }

    // Send OTP for verification (same as prepaid flow)
    setLoading(true);
    try {
      await sendCheckoutOtp(form.getValues('phone'));
    } finally {
      setLoading(false);
    }
  };

  // Handle COD order - Step 2: Verify OTP and place order
  const handleVerifyAndPlaceCODOrder = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    if (checkoutInFlightRef.current) return;

    checkoutInFlightRef.current = true;
    setOtpLoading(true);
    const checkoutCartId = cart.cartId;
    const checkoutCartRevision = cart.cartRevision;
    try {
      const authToken = await ensureCheckoutAuth();
      if (!authToken) return;

      if (!quoteReady || !quote) {
        toast.error('Please wait while we confirm your order total.');
        return;
      }

      const formData = form.getValues();
      const isShippingSameAsBilling = formData.isShippingSameAsBilling;

      // Build the checkout payload with COD payment method
      const payload: {
        name: string;
        email: string;
        phone: string;
        shippingAddress: {
          line1: string;
          line2?: string;
          city: string;
          state: string;
          pincode: string;
          country?: string;
        };
        billingAddress?: {
          name?: string;
          phone?: string;
          line1: string;
          line2?: string;
          city: string;
          state: string;
          pincode: string;
          country?: string;
        };
        isShippingSameAsBilling: boolean;
        notes?: string;
        items: typeof checkoutItems;
        paymentMethod: 'COD';
        buyer?: BuyerBlock;
        quoteToken: string;
      } = {
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        email: formData.email,
        shippingAddress: {
          line1: formData.shippingAddress.line1,
          line2: formData.shippingAddress.line2 || undefined,
          city: formData.shippingAddress.city,
          state: formData.shippingAddress.state,
          pincode: formData.shippingAddress.pincode,
          country: formData.shippingAddress.country || 'India',
        },
        isShippingSameAsBilling,
        items: checkoutItems,
        paymentMethod: 'COD',
        buyer: b2bEnabled && buyer ? checkoutBuyer(buyer) : undefined,
        quoteToken: quote.quoteToken,
      };

      // Add order notes if provided
      if (orderNotes.trim()) {
        payload.notes = orderNotes.trim();
      }

      // Only include billing address when different from shipping
      if (!isShippingSameAsBilling && formData.billingAddress) {
        payload.billingAddress = {
          name: formData.billingAddress.name || undefined,
          phone: formData.billingAddress.phone || undefined,
          line1: formData.billingAddress.line1,
          line2: formData.billingAddress.line2 || undefined,
          city: formData.billingAddress.city,
          state: formData.billingAddress.state,
          pincode: formData.billingAddress.pincode,
          country: formData.billingAddress.country || 'IN',
        };
      }

      const idempotencyKey = `${checkoutCartId}:${checkoutCartRevision}`;

      // Call the checkout endpoint with paymentMethod: 'COD'
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': idempotencyKey,
            'X-Checkout-Auth': authToken,
          },
        }
      );

      if (response.status === 202) {
        toast('This checkout is already being processed in another tab.');
        return;
      }

      // For COD, backend should return success with orderId directly (no Razorpay)
      if (response.data.orderId) {
        finalizeOrder(
          response.data.orderId,
          checkoutCartId,
          checkoutCartRevision
        );
      } else {
        toast.error(response.data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing COD order:', error);
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;

        if (
          handleCheckoutErrorCode(
            errorData,
            checkoutCartId,
            checkoutCartRevision
          )
        ) {
          return;
        }

        // Handle B2B errors
        if (errorData.code === 'B2B_NOT_ALLOWED') {
          setB2bEnabled(false);
          toast.error(B2B_NOT_AVAILABLE_MESSAGE);
        } else if (errorData.code === 'INVALID_GSTIN') {
          setB2bServerError('INVALID_GSTIN');
          toast.error(INVALID_BUSINESS_INVOICE_FORM_MESSAGE);
        } else if (errorData.code === 'MISSING_LEGAL_NAME') {
          setB2bServerError('MISSING_LEGAL_NAME');
          toast.error(BUSINESS_NAME_REQUIRED_MESSAGE);
        } else if (errorData.code === 'MISSING_B2B_ADDRESS') {
          setB2bServerError('MISSING_B2B_ADDRESS');
          toast.error(BUSINESS_BILLING_ADDRESS_REQUIRED_MESSAGE);
        } else if (
          typeof errorData === 'string' &&
          errorData.includes('Insufficient stock')
        ) {
          const stockMatch = errorData.match(
            /Insufficient stock for (.+)\. Available: (\d+), Requested: (\d+)/
          );
          if (stockMatch) {
            const [, productName, available, requested] = stockMatch;
            toast.error(
              `Sorry, we don't have enough stock for "${productName}". Only ${available} available, but you requested ${requested}. Please update your cart.`,
              { duration: 6000 }
            );
          } else {
            toast.error(errorData, { duration: 5000 });
          }
        } else if (errorData.error === 'Some products are not available') {
          toast.error(
            'Some products in your cart are no longer available. Please refresh and try again.'
          );
        } else {
          const errorMessage =
            errorData.error || errorData || 'Failed to place order';
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } finally {
      checkoutInFlightRef.current = false;
      setOtpLoading(false);
    }
  };

  // Show skeleton during hydration
  if (!isMounted) {
    return <CheckoutSkeleton />;
  }

  if (items.length === 0 && !isFinalizing) {
    return (
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6">
            Add items to your cart to checkout.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </Container>
    );
  }

  // Check if all items have valid IDs
  const invalidItems = items.filter((item) => !item.id);
  if (invalidItems.length > 0) {
    return (
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-red-600">
            Some items in your cart are invalid. Please refresh and try again.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <Container>
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          {/* Back to Cart Link */}
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          {/* Page Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Secure Checkout
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete your purchase securely
            </p>
          </div>

          {/* Progress Indicator */}
          <CheckoutProgress currentStep={currentStep} className="mb-8" />

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Delivery Address Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  Delivery Address
                </h2>

                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <AddressForm form={form} loading={loading} />
                  </form>
                </FormProvider>
              </div>

              {/* B2B / GST Invoice Section */}
              {allowB2BInvoices && (
                <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={b2bEnabled}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      onChange={(e) => {
                        setB2bEnabled(e.target.checked);
                        if (!e.target.checked) {
                          setBuyer(null);
                          setB2bServerError(null);
                        }
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      Use GST invoice (B2B)
                    </span>
                  </label>
                  {b2bEnabled && (
                    <div className="mt-4">
                      <B2bForm
                        disabled={loading || otpLoading}
                        shipToState={quoteState || null}
                        onChange={(val) => {
                          setBuyer(val);
                          setB2bServerError(null);
                        }}
                        serverError={b2bServerError}
                      />
                      {!buyer && (
                        <p className="mt-3 text-xs text-amber-700">
                          {COMPLETE_BUSINESS_INVOICE_DETAILS_MESSAGE}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Order Notes Section */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Order Notes (Optional)
                </h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for your order? (e.g., gift wrapping, specific delivery instructions, preferred delivery time)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200 hover:border-gray-300"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {orderNotes.length}/500 characters
                </p>
              </div>

              {/* Trust Badges - Desktop */}
              <div className="mt-6 hidden lg:block">
                <TrustBadges
                  variant="horizontal"
                  showPaymentMethods
                  showDeliveryPartners
                />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5">
              {stockNotices.length > 0 && (
                <div className="mb-4 space-y-2" role="status">
                  {stockNotices.map((notice) => (
                    <div
                      key={notice.key}
                      className={`flex items-start gap-2 rounded-md border p-3 text-sm ${
                        notice.error
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-amber-200 bg-amber-50 text-amber-800'
                      }`}
                    >
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{notice.text}</span>
                    </div>
                  ))}
                  {stockNotices.some((n) => n.error) && (
                    <Link
                      href="/cart"
                      className="inline-block text-sm font-medium underline"
                    >
                      Update cart
                    </Link>
                  )}
                </div>
              )}
              <OrderSummary
                items={displayItems}
                totalPrice={totalPrice}
                loading={loading}
                showOtpField={showOtpField}
                otp={otp}
                otpLoading={otpLoading}
                phoneNumber={otpPhone || form.getValues('phone')}
                otpMasked={otpMasked}
                otpCooldown={otpCooldown}
                otpAttemptsLeft={otpAttemptsLeft}
                onResendOtp={() =>
                  sendCheckoutOtp(otpPhone || form.getValues('phone'))
                }
                quote={quoteReady ? quote : null}
                quoteLoading={quoteLoading}
                quoteFailure={quoteFailure}
                onContinueWithoutGstInvoice={() => {
                  setB2bEnabled(false);
                  setBuyer(null);
                  setB2bServerError(null);
                }}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                onSubmit={form.handleSubmit(onSubmit)}
                onSetOtp={setOtp}
                onVerifyAndPay={handleVerifyAndPay}
                onPlaceCODOrder={handlePlaceCODOrder}
                onVerifyAndPlaceCODOrder={handleVerifyAndPlaceCODOrder}
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Mobile Sticky Checkout Bar */}
      <MobileStickyCheckout
        total={orderTotal}
        onAction={
          showOtpField
            ? paymentMethod === 'COD'
              ? handleVerifyAndPlaceCODOrder
              : handleVerifyAndPay
            : paymentMethod === 'COD'
              ? handlePlaceCODOrder
              : form.handleSubmit(onSubmit)
        }
        actionLabel={
          showOtpField
            ? paymentMethod === 'COD'
              ? 'Verify & Place Order'
              : 'Verify & Pay'
            : paymentMethod === 'COD'
              ? `Place Order (₹${orderTotal} COD)`
              : 'Continue'
        }
        isLoading={loading || otpLoading || phase !== 'idle'}
        disabled={
          (showOtpField && otp.length !== 6) ||
          !shippingData?.serviceable ||
          !quoteReady
        }
      />
      {isFinalizing && (
        <CheckoutProcessingOverlay
          title={
            phase === 'redirecting'
              ? 'Order confirmed'
              : 'Confirming your payment'
          }
          description={
            phase === 'redirecting'
              ? 'Taking you to your order confirmation…'
              : 'Please don’t close or refresh this page.'
          }
        />
      )}
    </div>
  );
};

export default CheckoutPage;
