'use client';

import { useState } from 'react';
import Container from '@/components/ui/container';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    category: 'Brand',
    question: 'What is our brand about?',
    answer: 'We are committed to providing high-quality products with transparent ingredients and excellent customer service. Our mission is to deliver the best possible results to our customers.',
  },
  {
    category: 'Shipping',
    question: 'Where do you ship to?',
    answer: 'We ship across India to over ***** pincodes. Orders can be placed with prepaid or cash on delivery payment options.',
  },
  {
    category: 'Delivery',
    question: 'How long will my order take?',
    answer: 'We usually ship within ** working hours after receiving an order. Once shipped, delivery takes * - * days. Users in metro cities can expect faster delivery (within ** days).',
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'You can raise a return request by emailing us. We offer returns/replacements for wrong shipments, damaged products, or expired products within ** days of delivery. For more details, please check our Return & Refund Policy page.',
  },
  {
    category: 'Orders',
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking number via email/SMS. You can use this to track your order status.',
  },
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery (COD) for eligible locations.',
  },
];

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Container>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about our products, shipping, and policies.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-4xl">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-start justify-between text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {faq.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg max-w-4xl">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-blue-800 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Please reach out to our customer support team.
          </p>
          <a
            href="/contact-us"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </Container>
  );
};

export default FAQPage;
