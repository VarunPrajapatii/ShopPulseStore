'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const OurStorySection = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Image Grid */}
        <div className="relative grid grid-cols-2 gap-4">
          {/* Main Large Image */}
          <div className="col-span-2 aspect-[16/10] relative rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/our-story-hero.webp"
              alt="Our brand story - quality products and craftsmanship"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          
          {/* Two Smaller Images */}
          <div className="aspect-square relative rounded-xl overflow-hidden shadow-md">
            <Image
              src="/our-story-left.webp"
              alt="Careful packaging and attention to detail"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          
          <div className="aspect-square relative rounded-xl overflow-hidden shadow-md">
            <Image
              src="/our-story-right.webp"
              alt="Premium quality materials and sustainable packaging"
              fill
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </div>
          
          {/* Floating Accent Element */}
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary rounded-full opacity-10 blur-2xl" />
        </div>
        
        {/* Right Side - Content */}
        <div className="lg:pl-8">
          {/* Section Label */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-[2px] bg-primary" />
            <span className="text-sm font-medium tracking-wider uppercase text-muted-foreground">
              Our Story
            </span>
          </div>
          
          {/* Heading */}
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground leading-tight mb-6">
            Crafted with Purpose,{' '}
            <span className="text-primary">Delivered with Care</span>
          </h2>
          
          {/* Description */}
          <div className="space-y-4 text-muted-foreground mb-8">
            <p className="text-lg leading-relaxed">
              We believe in quality over quantity. Every product in our collection is thoughtfully 
              selected to bring value and joy to your everyday life.
            </p>
            <p className="leading-relaxed">
              From our humble beginnings to today, our mission remains unchanged — to deliver 
              exceptional products with outstanding service. We&apos;re not just a store; we&apos;re a 
              community of people who appreciate the finer things done right.
            </p>
          </div>
          
          {/* Stats/Highlights */}
          <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-border">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center border-x border-border">
              <div className="text-2xl lg:text-3xl font-bold text-foreground">500+</div>
              <div className="text-sm text-muted-foreground">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-foreground">4.9</div>
              <div className="text-sm text-muted-foreground">Avg. Rating</div>
            </div>
          </div>
          
          {/* CTA */}
          <Link 
            href="/about" 
            className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-primary transition-colors group"
          >
            Learn More About Us
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
