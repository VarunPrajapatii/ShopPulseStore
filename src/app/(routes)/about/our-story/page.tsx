import Container from '@/components/ui/container';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Target, Award, Users, ShoppingBag, Sparkles } from 'lucide-react';

const OurStoryPage = () => {
  return (
    <Container>
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
            Our Story
          </h1>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            From humble beginnings to becoming your trusted shopping destination, 
            this is the journey of passion, quality, and commitment.
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-16 rounded-2xl overflow-hidden shadow-xl">
          <div className="relative w-full aspect-[21/9]">
            <Image
              src="/temp.jpeg"
              alt="Our Store"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Story Content */}
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Beginning Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It All Began</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                Every great journey starts with a simple idea. Ours began with a passion for providing 
                high-quality products that make a real difference in people&apos;s lives. We noticed a gap in the 
                market—customers were looking for products they could trust, at prices that made sense, 
                delivered with care and attention to detail.
              </p>
              <p>
                What started as a small operation has grown into a thriving business, but our core values 
                remain unchanged. We believe in quality over quantity, customer satisfaction over quick profits, 
                and building lasting relationships with everyone who shops with us.
              </p>
            </div>
          </section>

          {/* Vision & Mission */}
          <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To provide exceptional products that enhance everyday life, backed by outstanding 
                  customer service and a commitment to quality. We strive to make premium products 
                  accessible to everyone, everywhere.
                </p>
              </div>
              
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  To be the most trusted and loved shopping destination, known for our curated selection, 
                  authentic products, and genuine care for our customers. We envision a future where 
                  quality and affordability go hand in hand.
                </p>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Quality */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Quality First</h3>
                <p className="text-gray-600">
                  We never compromise on quality. Every product is carefully selected and 
                  thoroughly checked to ensure it meets our high standards.
                </p>
              </div>

              {/* Customer Focus */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Love</h3>
                <p className="text-gray-600">
                  Your satisfaction is our success. We go the extra mile to ensure every 
                  shopping experience is smooth, pleasant, and memorable.
                </p>
              </div>

              {/* Trust */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Built on Trust</h3>
                <p className="text-gray-600">
                  Transparency and honesty in every interaction. We believe in building 
                  long-term relationships based on trust and mutual respect.
                </p>
              </div>

            </div>
          </section>

          {/* Image with Text Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What Makes Us Different
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  In a world of endless options, we stand out by focusing on what truly matters: 
                  authentic products, fair prices, and genuine care for our customers.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ShoppingBag className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Curated Selection:</strong> Every product is handpicked and tested 
                      to ensure it meets our quality standards.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShoppingBag className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Transparent Practices:</strong> No hidden costs, no false promises. 
                      What you see is what you get.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShoppingBag className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Customer-Centric Service:</strong> From browsing to delivery and beyond, 
                      we&apos;re here to help at every step.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/temp.jpeg"
                  alt="What makes us different"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Journey in Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10K+</div>
                <div className="text-gray-300 text-sm md:text-base">Happy Customers</div>
              </div>

              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">500+</div>
                <div className="text-gray-300 text-sm md:text-base">Products</div>
              </div>

              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">20K+</div>
                <div className="text-gray-300 text-sm md:text-base">Orders Delivered</div>
              </div>

              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-400 mb-2">4.8</div>
                <div className="text-gray-300 text-sm md:text-base">Average Rating</div>
              </div>

            </div>
          </section>

          {/* Commitment Section */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Commitment to You</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                We understand that online shopping requires trust. That&apos;s why we&apos;ve implemented 
                rigorous quality checks, secure payment systems, and hassle-free return policies. 
                When you shop with us, you&apos;re not just buying a product—you&apos;re joining a community 
                of satisfied customers who value quality and authenticity.
              </p>
              <p>
                Our team works tirelessly to source the best products, negotiate fair prices, and ensure 
                swift delivery. We believe in continuous improvement, constantly listening to your feedback 
                and evolving to serve you better.
              </p>
            </div>
          </section>

          {/* Community Image */}
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <div className="relative w-full aspect-[16/9]">
              <Image
                src="/temp.jpeg"
                alt="Our Community"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Future Section */}
          <section className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Looking Ahead</h2>
            <div className="max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed text-lg">
              <p>
                As we grow, our focus remains on you—our valued customer. We&apos;re constantly expanding 
                our product range, improving our services, and finding new ways to enhance your shopping 
                experience.
              </p>
              <p>
                Thank you for being part of our story. Together, we&apos;re building something special—a 
                shopping destination that truly cares about quality, value, and customer satisfaction.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 md:p-12 text-center ">
            <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-xl mb-8 ">
              Experience the difference that quality and care make. Start shopping today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg"
              >
                Shop Now
              </Link>
              <Link
                href="/contact-us"
                className="inline-block bg-transparent border-2 border-white  px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors text-lg"
              >
                Contact Us
              </Link>
            </div>
          </section>

        </div>
      </div>
    </Container>
  );
};

export default OurStoryPage;
