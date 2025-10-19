import Container from '@/components/ui/container';
import { PackageCheck, RefreshCw, ShieldCheck, Clock } from 'lucide-react';

const ReturnPolicyPage = () => {
  return (
    <Container>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Return & Refund Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: ** ******* 2025
          </p>
        </div>

        <div className="max-w-4xl space-y-12">
          {/* Icons Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">* Days Return</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                <RefreshCw className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Easy Returns</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-3">
                <PackageCheck className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Quality Check</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-3">
                <ShieldCheck className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-sm font-semibold text-gray-700">100% Secure</p>
            </div>
          </div>

          {/* Policy Content */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We want you to be completely satisfied with your purchase. If for any reason you are not, 
                we offer a hassle-free return and refund policy. Please read the following terms carefully 
                to understand your rights and obligations with respect to returns and refunds.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Eligibility</h2>
              <p className="text-gray-700 mb-4">
                You may request a return or replacement for the following reasons:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Wrong Product Shipped:</strong> If you received a product different from what you ordered.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Damaged Product:</strong> If the product was damaged during transit or arrived in a defective condition.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Expired Product:</strong> If the product received is past its expiration date.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Missing Items:</strong> If any items from your order are missing upon delivery.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Window</h2>
              <p className="text-gray-700 leading-relaxed">
                Returns must be requested within <strong>** days</strong> of receiving your order. 
                Return requests made after this period will not be eligible for refunds or replacements.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Return</h2>
              <p className="text-gray-700 mb-4">
                To initiate a return, please follow these steps:
              </p>
              <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                <li>Contact our customer support team via email at <a href="mailto:support@brandname.com" className="text-blue-600 hover:underline">support@brandname.com</a></li>
                <li>Provide your order number and details about the issue</li>
                <li>Include clear photos of the product (if damaged or wrong item)</li>
                <li>Our team will review your request within 24-48 hours</li>
                <li>Once approved, we will arrange for pickup or provide return instructions</li>
              </ol>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Return Conditions</h2>
              <p className="text-gray-700 mb-4">
                To be eligible for a return, the product must meet the following conditions:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>The product must be unused and in the same condition as received</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Original packaging, labels, and seals must be intact</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>All accessories, manuals, and documentation must be included</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Products that have been opened, used, or tampered with are not eligible for return (except in cases of damage or defect)</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Process</h2>
              <p className="text-gray-700 mb-4">
                Once your return is received and inspected, we will notify you of the approval or rejection of your refund.
              </p>
              <p className="text-gray-700 mb-4">
                If approved, your refund will be processed as follows:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Prepaid Orders:</strong> Refund will be credited to your original payment method within 5-7 business days</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Cash on Delivery Orders:</strong> Refund will be processed via bank transfer to your provided account details within 7-10 business days</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Replacements</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you received a damaged or defective product, we will send you a replacement at no additional cost. 
                Replacement shipments are typically processed within 3-5 business days after the return is approved.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Please note that replacements are subject to product availability. If the product is out of stock, 
                we will offer a full refund instead.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Returnable Items</h2>
              <p className="text-gray-700 mb-4">
                Certain products are not eligible for return or refund:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Products purchased during special promotions or clearance sales (unless defective)</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Gift cards or vouchers</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Personalized or customized products</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Shipping Costs</h2>
              <p className="text-gray-700 leading-relaxed">
                For returns due to our error (wrong item, damaged product, etc.), we will cover the return shipping costs. 
                For all other returns, the customer is responsible for the shipping expenses. 
                We recommend using a trackable shipping service for your return.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about our Return & Refund Policy, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> <a href="mailto:support@brandname.com" className="text-blue-600 hover:underline">support@brandname.com</a>
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> <a href="tel:+911234567890" className="text-blue-600 hover:underline">+91 123 456 7890</a>
                </p>
                <p className="text-gray-700">
                  <strong>Support Hours:</strong> Monday - Saturday, 10:00 AM - 6:00 PM IST
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ReturnPolicyPage;
