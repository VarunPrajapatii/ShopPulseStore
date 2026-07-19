import type { Metadata } from 'next';
import ReturnPickerClient from './return-picker-client';

interface ReturnPickerPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: 'Start a return',
  description: 'Choose the items you want to return, exchange, or replace.',
  robots: { index: false, follow: false },
};

const ReturnPickerPage = async ({ params }: ReturnPickerPageProps) => {
  const { orderId } = await params;
  return <ReturnPickerClient orderId={orderId} />;
};

export default ReturnPickerPage;
