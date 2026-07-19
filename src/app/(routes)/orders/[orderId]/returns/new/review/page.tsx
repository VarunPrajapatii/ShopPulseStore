import type { Metadata } from 'next';
import ReturnReviewClient from './return-review-client';

interface ReturnReviewPageProps {
  params: Promise<{ orderId: string }>;
}

export const metadata: Metadata = {
  title: 'Review your return',
  description: 'Review your return request and confirm the settlement.',
  robots: { index: false, follow: false },
};

const ReturnReviewPage = async ({ params }: ReturnReviewPageProps) => {
  const { orderId } = await params;
  return <ReturnReviewClient orderId={orderId} />;
};

export default ReturnReviewPage;
