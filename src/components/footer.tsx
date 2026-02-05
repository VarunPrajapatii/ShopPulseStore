'use client'

import React from 'react'
import Link from 'next/link'
import { Instagram, Youtube, Facebook, Mail, Phone, MapPin, CreditCard, Wallet, Smartphone, Building2, ArrowUp } from 'lucide-react'

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          
          {/* Logo Section */}
          <div className="mb-10 lg:mb-12">
            <Link href="/" className="inline-block">
              <p className="font-bold text-4xl lg:text-5xl text-background">STORE</p>
            </Link>
          </div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Company Description */}
            <section className="lg:col-span-1">
              <p className="text-background/80 leading-relaxed text-sm lg:text-base">
                Your trusted destination for quality products. We&apos;re committed to providing exceptional value and outstanding customer service.
              </p>
              
              {/* Contact Info */}
              <div className="mt-6 space-y-3">
                <a href="mailto:hello@store.com" className="flex items-center gap-2 text-background/80 hover:text-background transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  hello@store.com
                </a>
                <a href="tel:+1234567890" className="flex items-center gap-2 text-background/80 hover:text-background transition-colors text-sm">
                  <Phone className="w-4 h-4" />
                  +1 (234) 567-890
                </a>
                <p className="flex items-center gap-2 text-background/80 text-sm">
                  <MapPin className="w-4 h-4" />
                  Your City, Country
                </p>
              </div>
            </section>

            {/* Quick Links */}
            <section>
              <h2 className="text-base font-semibold text-background mb-4">Quick Links</h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="text-background/70 hover:text-background transition-colors text-sm link-underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-background/70 hover:text-background transition-colors text-sm link-underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact-us" className="text-background/70 hover:text-background transition-colors text-sm link-underline">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </section>

            {/* Help & Support */}
            <section>
              <h2 className="text-base font-semibold text-background mb-4">Help & Support</h2>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/faq" className="text-background/70 hover:text-background transition-colors text-sm link-underline">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/returns-exchanges" className="text-background/70 hover:text-background transition-colors text-sm link-underline">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-use" className="text-background/70 hover:text-background transition-colors text-sm link-underline">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </section>

            {/* Social Media */}
            <section>
              <h2 className="text-base font-semibold text-background mb-4">Follow Us</h2>
              <div className="flex items-center gap-3">
                <Link 
                  href="#" 
                  className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors hover-scale"
                  aria-label="Follow on Instagram"
                >
                  <Instagram size={18} className="text-background" />
                </Link>

                <Link 
                  href="#" 
                  className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors hover-scale"
                  aria-label="Follow on Facebook"
                >
                  <Facebook size={18} className="text-background" />
                </Link>

                <Link 
                  href="#" 
                  className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors hover-scale"
                  aria-label="Follow on YouTube"
                >
                  <Youtube size={18} className="text-background" />
                </Link>

                <Link 
                  href="#" 
                  className="w-10 h-10 bg-background/10 hover:bg-background/20 rounded-full flex items-center justify-center transition-colors hover-scale"
                  aria-label="Follow on X (Twitter)"
                >
                  <span className="text-background text-sm font-bold">X</span>
                </Link>
              </div>
            </section>

          </div>
        </div>
        
        {/* Payment Methods Section */}
        <div className="border-t border-background/10 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs text-background/60 mb-3 text-center sm:text-left">Powered by Razorpay - We Accept</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                {/* Cards */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-background/10 rounded-md">
                  <CreditCard size={14} className="text-background/80" />
                  <span className="text-xs text-background/80">Cards</span>
                </div>
                
                {/* UPI */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-background/10 rounded-md">
                  <Smartphone size={14} className="text-background/80" />
                  <span className="text-xs text-background/80">UPI</span>
                </div>
                
                {/* Wallets */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-background/10 rounded-md">
                  <Wallet size={14} className="text-background/80" />
                  <span className="text-xs text-background/80">Wallets</span>
                </div>
                
                {/* Net Banking */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-background/10 rounded-md">
                  <Building2 size={14} className="text-background/80" />
                  <span className="text-xs text-background/80">Net Banking</span>
                </div>
              </div>
            </div>
            
            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 px-4 py-2 bg-background/10 hover:bg-background/20 rounded-full transition-colors group"
              aria-label="Back to top"
            >
              <span className="text-sm text-background/80 group-hover:text-background">Back to Top</span>
              <ArrowUp size={16} className="text-background/80 group-hover:text-background transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-background/10 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-background/60 text-center sm:text-left">
              © {new Date().getFullYear()} Store. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-xs">
              <Link href="/terms-of-use" className="text-background/60 hover:text-background transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-background/60 hover:text-background transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer