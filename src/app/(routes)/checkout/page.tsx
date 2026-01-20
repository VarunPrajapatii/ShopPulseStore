'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';
import toast from 'react-hot-toast';
import { formSchema, CheckoutFormValues } from '@/lib/zodSchema';
import { AddressForm, OrderSummary } from './components';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import CheckoutProgress from '@/components/ui/checkout-progress';
import TrustBadges from '@/components/ui/trust-badges';
import MobileStickyCheckout from '@/components/ui/mobile-sticky-checkout';

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
}

type CheckoutStep = "address" | "verification" | "payment" | "done";

const CheckoutPage = () => {
  const cart = useCart();
  const items = cart.items;
  const router = useRouter();
  const [orderNotes, setOrderNotes] = useState('');
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');


  // Items for display in order summary (with name and size from variant)
  const displayItems = items.map((item) => ({
    productId: item.id,
    variantId: item.variantId,
    name: item.name,
    quantity: item.quantity || 1,
    priceAtPurchase: item.sellingPrice || item.price,
    // Only include size info for variant products (not "Default")
    sizeName: item.selectedVariant.size.name !== 'Default' ? item.selectedVariant.size.name : null,
    sizeValue: item.selectedVariant.size.name !== 'Default' ? item.selectedVariant.size.value : null,
  }));

  // Items for backend API (with variantId for variant tracking)
  const checkoutItems = items.map((item) => ({
    productId: item.id,
    // Only send variantId for actual variant products
    variantId: item.selectedVariant.size.name !== 'Default' ? item.variantId : null,
    name: item.name,
    quantity: item.quantity || 1,
    priceAtPurchase: item.sellingPrice || item.price,
    // Only send size for variant products
    size: item.selectedVariant.size.name !== 'Default' ? item.selectedVariant.sizeId : null,
  }));


  const [loading, setLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update step based on flow
  useEffect(() => {
    if (showOtpField) {
      setCurrentStep('verification');
    } else {
      setCurrentStep('address');
    }
  }, [showOtpField]);

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
    // Use sellingPrice if available, otherwise use regular price
    const itemPrice = item.sellingPrice || Number(item.price);
    return total + itemPrice * (item.quantity || 1);
  }, 0);

  // Calculate order total with shipping
  const shippingThreshold = 499;
  const shippingCost = totalPrice >= shippingThreshold ? 0 : 49;
  const orderTotal = totalPrice + shippingCost;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onSubmit = async (data: CheckoutFormValues) => {
    setLoading(true);
    try {
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_URL}/phone-verification`,
      //   {
      //     phone: data.phone,
      //     fullName: `${data.firstName} ${data.lastName}`,
      //     address: {
      //       flatHouse: data.flatHouse,
      //       areaStreet: data.areaStreet,
      //       landmark: data.landmark,
      //       townCity: data.townCity,
      //       state: data.state,
      //       pincode: data.pincode,
      //     },
      //   }
      // );

      // TODO: Uncomment above API call when OTP backend is ready
      // For now, showing OTP field for testing
      
      // if (response.data) {
      setShowOtpField(true);
      toast.success('OTP sent to your phone number');
      // }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndPay = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    try {
      // TODO: Add OTP verification API call
      // const response = await axios.post(
      //   `${process.env.NEXT_PUBLIC_API_URL}/otp`,
      //   {
      //     phone: form.getValues("phone"),
      //     otp: otp,
      //   }
      // );

      // TEMPORARY: Hardcoded OTP verification for testing Razorpay
      // Remove this line and uncomment the above API call when OTP backend is ready
      const isOtpVerified = true; // TODO: Replace with: response.data.verified

      if (!isOtpVerified) {
        toast.error('Invalid OTP. Please try again.');
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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/checkout`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );


      const { razorpayOrderId, amount, email, phone } = response.data;

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount * 100,
        currency: 'INR',
        name: 'varuntd',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        prefill: {
          email: email,
          contact: phone,
        },
        handler: async function (razorpayResponse: RazorpayResponse) {
          try {
            const verifyResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/checkout/verify`,
              {
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              }
            );

            if (verifyResponse.data.success) {
              cart.removeAll();
              toast.success('Payment successful!');
              router.push(`/order-success?orderId=${response.data.orderId}`);
            } else {
              toast.error('Payment verification failed!');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed!');
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled');
            console.log('Payment cancelled');
          },
        },
        theme: {
          color: '#000000', // Your brand color
        },
      };

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      toast.success('OTP verified! Opening payment gateway...');
      setShowOtpField(false);
      setOtp('');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response data:', error.response.data);
        const errorData = error.response.data;
        
        // Handle insufficient stock error
        if (typeof errorData === 'string' && errorData.includes('Insufficient stock')) {
          // Extract product name and stock info from error message
          const stockMatch = errorData.match(/Insufficient stock for (.+)\. Available: (\d+), Requested: (\d+)/);
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
          toast.error('Some products in your cart are no longer available. Please refresh and try again.');
        } else {
          const errorMessage = errorData.error || errorData || 'Failed to process checkout';
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to verify OTP. Please try again.');
      }
    } finally {
      setOtpLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add items to your cart to checkout.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </Container>
    );
  }

  // Check if all items have valid IDs
  const invalidItems = items.filter(item => !item.id);
  if (invalidItems.length > 0) {
    return (
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-red-600">Some items in your cart are invalid. Please refresh and try again.</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Secure Checkout</h1>
            <p className="text-sm text-gray-500 mt-1">Complete your purchase securely</p>
          </div>

          {/* Progress Indicator */}
          <CheckoutProgress currentStep={currentStep} className="mb-8" />

          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            {/* Delivery Address Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Delivery Address
                </h2>

                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <AddressForm form={form} loading={loading} />
                  </form>
                </FormProvider>
              </div>

              {/* Order Notes Section */}
              <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Notes (Optional)</h3>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for your order? (e.g., gift wrapping, specific delivery instructions, preferred delivery time)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{orderNotes.length}/500 characters</p>
              </div>

              {/* Trust Badges - Desktop */}
              <div className="mt-6 hidden lg:block">
                <TrustBadges variant="horizontal" showPaymentMethods showDeliveryPartners />
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <OrderSummary
              items={displayItems}
              totalPrice={totalPrice}
              loading={loading}
              showOtpField={showOtpField}
              otp={otp}
              otpLoading={otpLoading}
              phoneNumber={form.getValues('phone')}
              onSubmit={form.handleSubmit(onSubmit)}
              onSetOtp={setOtp}
              onVerifyAndPay={handleVerifyAndPay}
            />
          </div>
        </div>
      </Container>

      {/* Mobile Sticky Checkout Bar */}
      <MobileStickyCheckout
        total={orderTotal}
        onAction={showOtpField ? handleVerifyAndPay : form.handleSubmit(onSubmit)}
        actionLabel={showOtpField ? "Verify & Pay" : "Continue"}
        isLoading={loading || otpLoading}
        disabled={showOtpField && otp.length !== 6}
      />
    </div>
  );
};

export default CheckoutPage;
