import React from 'react'
// import Image from 'next/image'
import Link from 'next/link'
import { Instagram, Youtube, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-black">
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-10">
          
          {/* Logo Section */}
          <div className="mb-8 lg:mb-12">
            <Link href="/" className="ml-4 flex lg:ml-0 gap-x-2">
              <p className="font-bold text-7xl text-gray-200">STORE</p>
            </Link>
          </div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Side - Company Description */}
            <section className="lg:col-span-1">
              <p className="text-gray-200 leading-relaxed font-medium text-base lg:text-lg">
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. A repellendus eum officiis consequuntur placeat quidem nostrum, modi rem iusto autem deleniti, libero temporibus obcaecati quibusdam laboriosam cumque inventore similique enim!
                Quasi commodi quaerat magni dignissimos explicabo sunt!
              </p>
            </section>

            {/* About Us Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-200 mb-6">About Us</h2>
              <ul className="space-y-3">
                <li>
                  <Link href="/about/our-story" className="text-gray-200 hover:font-semibold transition-all">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us" className="text-gray-200 hover:font-semibold transition-all">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-200 hover:font-semibold transition-all">
                    Blog
                  </Link>
                </li>
              </ul>
            </section>

            {/* Help & Support Section */}
            <section>
              <h2 className="text-xl font-bold text-gray-200 mb-6">Terms &amp; Conditions</h2>
              <ul className="space-y-3">
                <li>
                  <Link href="/returns-exchanges" className="text-gray-200 hover:font-semibold transition-all">
                    Returns &amp; Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-200 hover:font-semibold transition-all">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-use" className="text-gray-200 hover:font-semibold transition-all">
                    Terms of Use
                  </Link>
                </li>
                
              </ul>
            </section>

          </div>

          {/* Social Media Icons - Horizontal */}
          <section className="mt-8 pt-5 ">
            <h2 className="text-lg font-bold text-gray-200 mb-4 text-center lg:text-left">Follow Us</h2>
            <div className="flex justify-center lg:justify-start items-center gap-4">
              <Link 
                href="#" 
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all group"
                aria-label="Follow Pure Essence on Instagram"
              >
                <Instagram size={22} className="text-gray-800 group-hover:text-pink-600" />
              </Link>

              <Link 
                href="#" 
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all group"
                aria-label="Follow Pure Essence on Facebook"
              >
                <Facebook size={22} className="text-gray-800 group-hover:text-blue-600" />
              </Link>

              <Link 
                href="#" 
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all group"
                aria-label="Follow Pure Essence on YouTube"
              >
                <Youtube size={22} className="text-gray-800 group-hover:text-red-600" />
              </Link>

              <Link 
                href="#" 
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 transition-all group"
                aria-label="Follow Pure Essence on Twitter"
              >
                <div className="text-gray-800 group-hover:text-black text-2xl font-extrabold">X</div>
              </Link>

            </div>
          </section>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-600 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <p className="text-sm font-light text-gray-200 text-center lg:text-left">
              Developed in 2025 by <Link href={"https://varuntd.com"} className='font-semibold hover:underline '>varuntd.com</Link>
            </p>
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
              <Link href="/terms-of-use" className="text-gray-200 hover:underline transition-colors">
                Terms of Use
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer