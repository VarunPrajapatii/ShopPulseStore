'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Container from '@/components/ui/container';
import useCart from '@/hooks/use-cart';
import toast from 'react-hot-toast';
import { formSchema } from '@/lib/zodSchema';
import { AddressForm, OrderSummary } from './components';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

type CheckoutFormValues = z.infer<typeof formSchema>;

const CheckoutPage = () => {
  const cart = useCart();
  const items = cart.items;
  const router = useRouter();


  // Items for display in order summary (with name)
  const displayItems = items.map((item) => ({
    productId: item.id,
    name: item.name,
    quantity: item.quantity || 1,
    priceAtPurchase: item.price,
    sizeName: item.size.name,
    sizeValue: item.size.value,
  }));

  // Items for backend API (with name to match working app)
  const checkoutItems = items.map((item) => ({
    productId: item.id,
    name: item.name,
    quantity: item.quantity || 1,
    priceAtPurchase: item.price,
    size: item.size.id,
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

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      pincode: '',
      flatHouse: '',
      areaStreet: '',
      landmark: '',
      townCity: '',
      state: '',
    },
  });

  const totalPrice = items.reduce((total, item) => {
    return total + Number(item.price) * (item.quantity || 1);
  }, 0);

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

      const address = {
        flatHouse: form.getValues('flatHouse'),
        areaStreet: form.getValues('areaStreet'),
        landmark: form.getValues('landmark'),
        townCity: form.getValues('townCity'),
        state: form.getValues('state'),
        pincode: form.getValues('pincode'),
      };

      const addressString = `${address.flatHouse}, ${address.areaStreet}, ${
        address.landmark ? address.landmark + ', ' : ''
      }${address.townCity}, ${address.state} - ${address.pincode}`;

      const payload = {
        name: `${form.getValues('firstName')} ${form.getValues('lastName')}`,
        phone: form.getValues('phone'),
        email: form.getValues('email'),
        address: addressString,
        items: checkoutItems,
      };

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
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>
          <p className="text-gray-600">Your cart is empty.</p>
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
    <Container>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Delivery Address Form */}
          <div className="lg:col-span-7">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delivery Address
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AddressForm form={form} loading={loading} />
            </form>
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
  );
};

export default CheckoutPage;
