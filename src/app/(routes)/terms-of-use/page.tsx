import Container from '@/components/ui/container';

const TermsOfUsePage = () => {
  return (
    <Container>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Use
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: ** ******* 2025
          </p>
        </div>

        <div className="max-w-4xl prose prose-gray">
          {/* Introduction */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to our e-commerce store. These Terms of Use govern your access to and use of our website, 
              services, and products. By accessing or using our website, you agree to be bound by these Terms of Use 
              and our Privacy Policy. If you do not agree with any part of these terms, please do not use our website.
            </p>
          </section>

          {/* 1.0 Definitions */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1.0 Definitions</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.1 Website</h3>
                <p className="text-gray-700 ml-4">
                  &quot;Website&quot; refers to our e-commerce platform accessible at our domain name and all related 
                  subdomains, mobile applications, and services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.2 User</h3>
                <p className="text-gray-700 ml-4">
                  &quot;User,&quot; &quot;you,&quot; or &quot;your&quot; refers to any individual or entity that accesses 
                  or uses our Website, whether as a guest or registered member.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.3 We, Us, Our</h3>
                <p className="text-gray-700 ml-4">
                  &quot;We,&quot; &quot;us,&quot; or &quot;our&quot; refers to the company operating this e-commerce store 
                  and all its affiliates, employees, and authorized representatives.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">1.4 Products</h3>
                <p className="text-gray-700 ml-4">
                  &quot;Products&quot; refers to all goods, merchandise, and items available for purchase through our Website.
                </p>
              </div>
            </div>
          </section>

          {/* 2.0 Use of Website */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2.0 Use of Website</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Eligibility</h3>
                <p className="text-gray-700 ml-4 mb-2">
                  By using this Website, you represent and warrant that:
                </p>
                <ul className="ml-8 space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>You are at least 18 years of age or have parental/guardian consent</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>You have the legal capacity to enter into binding contracts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>You will provide accurate and complete information</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Account Registration</h3>
                <p className="text-gray-700 ml-4 mb-2">
                  To access certain features, you may need to create an account. You agree to:
                </p>
                <ul className="ml-8 space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Provide accurate, current, and complete information during registration</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Maintain and update your information to keep it accurate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Keep your password secure and confidential</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Notify us immediately of any unauthorized use of your account</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Prohibited Activities</h3>
                <p className="text-gray-700 ml-4 mb-2">
                  You agree not to engage in any of the following prohibited activities:
                </p>
                <ul className="ml-8 space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Violating any applicable laws or regulations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Infringing on intellectual property rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Transmitting viruses, malware, or harmful code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Attempting to gain unauthorized access to our systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Collecting or harvesting data from our Website</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Impersonating any person or entity</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3.0 Orders and Payments */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3.0 Orders and Payments</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.1 Product Information</h3>
                <p className="text-gray-700 ml-4">
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant 
                  that product descriptions or other content is accurate, complete, reliable, current, or error-free. 
                  We reserve the right to correct any errors, inaccuracies, or omissions at any time.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.2 Pricing</h3>
                <p className="text-gray-700 ml-4">
                  All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise 
                  stated. We reserve the right to change prices at any time without prior notice. The price charged 
                  will be the price displayed at the time of order placement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.3 Order Acceptance</h3>
                <p className="text-gray-700 ml-4">
                  Your receipt of an order confirmation does not signify our acceptance of your order. We reserve the 
                  right to accept or decline your order for any reason, including product availability, errors in pricing 
                  or product information, or suspected fraudulent activity.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.4 Payment Methods</h3>
                <p className="text-gray-700 ml-4">
                  We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery 
                  (where available). By providing payment information, you represent that you are authorized to use the 
                  payment method and authorize us to charge the total amount.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">3.5 Order Cancellation</h3>
                <p className="text-gray-700 ml-4 mb-2">
                  You may cancel your order under the following conditions:
                </p>
                <ul className="ml-8 space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Before the order has been shipped</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>By contacting our customer support team</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Cancellation fees may apply for certain payment methods</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4.0 Shipping and Delivery */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4.0 Shipping and Delivery</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Delivery Timeframes</h3>
                <p className="text-gray-700 ml-4">
                  We aim to process orders within 24 working hours. Delivery timeframes vary by location and typically 
                  range from 2-7 business days. These are estimates and not guaranteed delivery dates.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Shipping Charges</h3>
                <p className="text-gray-700 ml-4">
                  Shipping charges, if applicable, will be displayed at checkout before you complete your purchase. 
                  We may offer free shipping promotions from time to time.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Delivery Issues</h3>
                <p className="text-gray-700 ml-4">
                  If you do not receive your order within the estimated delivery timeframe, please contact our customer 
                  support team. We are not responsible for delays caused by courier services or circumstances beyond our control.
                </p>
              </div>
            </div>
          </section>

          {/* 5.0 Intellectual Property */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5.0 Intellectual Property</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.1 Ownership</h3>
                <p className="text-gray-700 ml-4">
                  All content on this Website, including text, graphics, logos, images, videos, and software, is the 
                  property of our company or its content suppliers and is protected by intellectual property laws.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">5.2 Limited License</h3>
                <p className="text-gray-700 ml-4">
                  We grant you a limited, non-exclusive, non-transferable license to access and use our Website for 
                  personal, non-commercial purposes. You may not reproduce, distribute, modify, or create derivative 
                  works without our prior written consent.
                </p>
              </div>
            </div>
          </section>

          {/* 6.0 Limitation of Liability */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6.0 Limitation of Liability</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.1 Disclaimer</h3>
                <p className="text-gray-700 ml-4">
                  Our Website and products are provided &quot;as is&quot; without warranties of any kind, either express 
                  or implied. We do not warrant that our Website will be uninterrupted, secure, or error-free.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">6.2 Liability Limitations</h3>
                <p className="text-gray-700 ml-4">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages arising out of your use of our Website or products. Our total 
                  liability shall not exceed the amount paid by you for the specific product or service.
                </p>
              </div>
            </div>
          </section>

          {/* 7.0 Privacy */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7.0 Privacy</h2>
            <p className="text-gray-700 ml-6">
              Your use of our Website is also governed by our Privacy Policy. Please review our Privacy Policy to 
              understand how we collect, use, and protect your personal information.
            </p>
          </section>

          {/* 8.0 Dispute Resolution */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8.0 Dispute Resolution</h2>
            
            <div className="ml-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">8.1 Governing Law</h3>
                <p className="text-gray-700 ml-4">
                  These Terms of Use shall be governed by and construed in accordance with the laws of India, without 
                  regard to conflict of law provisions.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">8.2 Jurisdiction</h3>
                <p className="text-gray-700 ml-4">
                  Any disputes arising out of or relating to these Terms of Use or your use of our Website shall be 
                  subject to the exclusive jurisdiction of the courts located in [Your City, State], India.
                </p>
              </div>
            </div>
          </section>

          {/* 9.0 Changes to Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9.0 Changes to Terms</h2>
            <p className="text-gray-700 ml-6">
              We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon 
              posting on our Website. Your continued use of the Website after changes are posted constitutes your 
              acceptance of the modified terms.
            </p>
          </section>

          {/* 10.0 Contact Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10.0 Contact Information</h2>
            <p className="text-gray-700 ml-6 mb-4">
              If you have any questions about these Terms of Use, please contact us:
            </p>
            <div className="ml-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong> <a href="mailto:legal@brandname.com" className="text-blue-600 hover:underline">legal@brandname.com</a>
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
    </Container>
  );
};

export default TermsOfUsePage;
