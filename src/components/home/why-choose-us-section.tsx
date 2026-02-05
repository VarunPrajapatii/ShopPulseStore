'use client';

import Image from 'next/image';
import { 
  Shield, 
  Truck, 
  RefreshCw, 
  Headphones,
  Award,
  Heart,
  LucideIcon
} from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    icon: Shield,
    title: 'Guaranteed Quality',
    description: 'Every product is carefully inspected to ensure it meets our high standards before reaching you.',
  },
  {
    icon: Truck,
    title: 'Fast & Free Shipping',
    description: 'Enjoy free shipping on all orders. We partner with trusted couriers for reliable delivery.',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: 'Return within 30 days for a full refund, no questions asked. Your satisfaction matters.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated support team is here to help you anytime, anywhere you need us.',
  },
  {
    icon: Award,
    title: 'Best Price Promise',
    description: 'We constantly monitor prices to ensure you get the best value for your money.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Built around your needs. We listen, adapt, and continuously improve based on feedback.',
  },
];

const WhyChooseUsSection = () => {
  const { ref: leftRef, isInView: leftInView } = useInView({ threshold: 0.2 });
  const { ref: rightRef, isInView: rightInView } = useInView({ threshold: 0.1 });

  return (
    <section className="w-full py-8 lg:py-16">
      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Left side - Hero with overlay text */}
        <div 
          ref={leftRef}
          className={`relative w-full lg:w-1/2 min-h-[400px] lg:min-h-[600px] rounded-xl lg:rounded-r-3xl overflow-hidden scroll-animate-left ${leftInView ? 'in-view' : ''}`}
        >
          {/* Hero Image */}
          <Image
            src="/why-choose-us-hero.webp"
            alt="Happy customer opening their package"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
            priority
          />
          
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/60" />
          
          {/* Overlay content */}
          <div className="absolute inset-0 flex flex-col justify-center items-center p-6 sm:p-8 lg:p-16">
            <div className="text-center lg:text-left max-w-md">
              <h2 className="text-primary-foreground text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-4">
                Why
                <br />
                Choose Us
              </h2>
              <p className="text-primary-foreground/90 text-base sm:text-xl leading-relaxed">
                We&apos;ve built our store around what matters most — quality products, 
                exceptional service, and a seamless shopping experience that puts you first.
              </p>
              
              {/* Trust Stats */}
              <div className="flex gap-6 mt-8">
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-primary-foreground">50K+</div>
                  <div className="text-sm text-primary-foreground/80">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl lg:text-4xl font-bold text-primary-foreground">4.9</div>
                  <div className="text-sm text-primary-foreground/80">Avg. Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Feature blocks */}
        <div ref={rightRef} className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`flex gap-4 lg:gap-6 pb-6 scroll-animate-right ${rightInView ? 'in-view' : ''} ${
                  index < features.length - 1 ? 'border-b border-border' : ''
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-muted rounded-xl flex items-center justify-center hover-scale">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-foreground" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;