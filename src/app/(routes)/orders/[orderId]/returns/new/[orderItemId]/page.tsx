import type { Metadata } from 'next';
import ReturnItemConfigClient from './return-item-config-client';

interface ReturnItemConfigPageProps {
  params: Promise<{ orderId: string; orderItemId: string }>;
}

export const metadata: Metadata = {
  title: 'Return details',
  description:
    'Tell us why you’re returning this item and how you’d like it resolved.',
  robots: { index: false, follow: false },
};

const ReturnItemConfigPage = async ({ params }: ReturnItemConfigPageProps) => {
  const { orderId, orderItemId } = await params;
  return <ReturnItemConfigClient orderId={orderId} orderItemId={orderItemId} />;
};

export default ReturnItemConfigPage;
