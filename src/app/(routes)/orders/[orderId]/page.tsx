import type { Metadata } from 'next';
import OrderHubClient from './order-hub-client';

interface OrderHubPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: 'Track your order',
  description: 'Track your order, request a return, exchange, or replacement.',
  robots: { index: false, follow: false },
};

const OrderHubPage = async ({ params }: OrderHubPageProps) => {
  const { orderId } = await params;
  return <OrderHubClient orderId={orderId} />;
};

export default OrderHubPage;
