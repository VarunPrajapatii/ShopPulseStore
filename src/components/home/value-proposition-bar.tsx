import { Truck, RotateCcw, Shield, Headphones, LucideIcon } from 'lucide-react';

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const valueProps: ValueProp[] = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders above ₹999',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure checkout',
  },
  {
    icon: Headphones,
    title: 'Support 24/7',
    description: 'Dedicated support',
  },
];

const ValuePropositionBar = () => {
  return (
    <section className="w-full bg-muted py-10 md:py-12 my-12 rounded-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
          {valueProps.map((prop, index) => {
            // Alternating layout: even indices have icon on top, odd indices have icon on bottom (on mobile)
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={index}
                className={`flex flex-col items-center text-center gap-3 py-2 md:py-0 ${
                  // Add divider on desktop (not on last item)
                  index < valueProps.length - 1 ? 'md:border-r md:border-border/50' : ''
                }`}
              >
                {/* Icon - alternating position on mobile */}
                <div className={`${!isEven ? 'md:order-1 order-2' : 'order-1'}`}>
                  <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center shadow-sm border border-border/50">
                    <prop.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                {/* Text content */}
                <div className={`${!isEven ? 'md:order-2 order-1' : 'order-2'}`}>
                  <h3 className="font-semibold text-sm md:text-base text-foreground">
                    {prop.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                    {prop.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValuePropositionBar;
