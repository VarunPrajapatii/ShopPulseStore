'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/ui/container';
import { CheckCircle, Package, Mail, Phone, MapPin, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import getOrderDetails, { OrderDetails } from '@/actions/get-order-details';
import Currency from '@/components/ui/currency';
import Image from 'next/image';

const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Trigger confetti animation on page load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getOrderDetails(orderId);
        if (data) {
          setOrderDetails(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    return {
      date: date.toLocaleDateString('en-US', dateOptions),
      time: date.toLocaleTimeString('en-US', timeOptions),
    };
  };

  // Get order status badge styling
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      PAID: { bg: 'bg-green-100', text: 'text-green-800', label: 'Payment Confirmed' },
      PAYMENT_INITIATED: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Payment Pending' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
      DELIVERED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !orderDetails) {
    return (
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-red-100 p-6">
                <AlertCircle className="h-16 w-16 text-red-600" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Invalid Order</h1>

            <p className="text-lg text-gray-600 mb-8">
              We couldn&apos;t find the order you&apos;re looking for. Please check your order ID or contact support.
            </p>

            <Link
              href="/"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  const orderDateTime = formatDateTime(orderDetails.createdAt);

  return (
    <Container>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>

            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase, {orderDetails.name}! Your order has been confirmed.
            </p>

            {/* Order ID Card */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2 font-medium">Your Order ID</p>
              <p className="text-2xl font-bold text-gray-900 mb-2 font-mono">{orderDetails.orderId}</p>
              <p className="text-sm text-gray-600">
                Keep this order ID for tracking your order or if you need any assistance regarding your order.
              </p>
            </div>

            {/* Order Status Badge */}
            <div className="mb-4">{getStatusBadge(orderDetails.orderStatus)}</div>
          </div>

          <div className="space-y-8">
            {/* Order Items */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Order Items
              </h2>

              <div className="space-y-4">
                {orderDetails.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={item.productImageUrl}
                        alt={item.productName}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{item.productName}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span>Quantity: {item.quantity}</span>
                        <span>•</span>
                        <span>Price: ₹{item.priceAtPurchase}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        <Currency amount={item.lineTotal.toString()} />
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <Currency amount={orderDetails.subtotal.toString()} />
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <Currency amount={orderDetails.tax.toString()} />
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {orderDetails.shippingCost === 0 ? (
                      <span className="text-green-600 font-semibold">FREE</span>
                    ) : (
                      <Currency amount={orderDetails.shippingCost.toString()} />
                    )}
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <Currency amount={orderDetails.totalAmount.toString()} />
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Delivery Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-gray-900 font-medium break-all">{orderDetails.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                      <p className="text-gray-900 font-medium">{orderDetails.phone}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        You will be contacted and messaged regarding your order updates on this number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h3>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Shipping To</p>
                    <p className="text-gray-900 leading-relaxed">{orderDetails.address}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Your order will be delivered to this address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline & Payment Info */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Timeline */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order Timeline
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Order Placed</p>
                    <p className="text-gray-900 font-medium">{orderDateTime.date}</p>
                    <p className="text-sm text-gray-500">{orderDateTime.time}</p>
                  </div>

                  {orderDetails.paidAt && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">Payment Confirmed</p>
                      <p className="text-gray-900 font-medium">
                        {formatDateTime(orderDetails.paidAt).date}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(orderDetails.paidAt).time}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className={`font-semibold ${orderDetails.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {orderDetails.isPaid ? 'Paid' : 'Pending'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">Razorpay Order ID</p>
                    <p className="text-gray-900 font-mono text-sm break-all">
                      {orderDetails.razorpayOrderId}
                    </p>
                  </div>

                  {orderDetails.razorpayPaymentId && (
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">Razorpay Payment ID</p>
                      <p className="text-gray-900 font-mono text-sm break-all">
                        {orderDetails.razorpayPaymentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Email Confirmation Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Confirmation Email Sent</p>
                  <p className="text-sm text-blue-800">
                    A confirmation email with your order details has been sent to{' '}
                    <span className="font-semibold">{orderDetails.email}</span>. Please check your inbox
                    and spam folder.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/"
                className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

const OrderSuccessPage = () => {
  return (
    <Suspense fallback={
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </Container>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
};

export default OrderSuccessPage;

