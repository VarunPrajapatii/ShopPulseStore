"use client";

import { Shield, Truck, RotateCcw, BadgeCheck, Lock } from "lucide-react";

interface TrustBadgesProps {
  variant?: "horizontal" | "vertical" | "compact";
  showPaymentMethods?: boolean;
  showDeliveryPartners?: boolean;
  className?: string;
}

const TrustBadges: React.FC<TrustBadgesProps> = ({
  variant = "horizontal",
  showPaymentMethods = true,
  showDeliveryPartners = false,
  className = "",
}) => {
  const badges = [
    {
      icon: Shield,
      title: "Secure Checkout",
      description: "256-bit SSL encryption",
    },
    {
      icon: Truck,
      title: "Fast Delivery",
      description: "2-5 business days",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day return policy",
    },
    {
      icon: BadgeCheck,
      title: "100% Authentic",
      description: "Genuine products",
    },
  ];

  const paymentMethods = [
    { name: "Visa", bg: "bg-[#1A1F71]", text: "VISA" },
    { name: "Mastercard", bg: "bg-[#EB001B]", text: "MC" },
    { name: "RuPay", bg: "bg-[#097969]", text: "RuPay" },
    { name: "UPI", bg: "bg-[#5F259F]", text: "UPI" },
  ];

  const deliveryPartners = [
    "Delhivery",
    "Blue Dart",
    "DTDC",
    "Ekart",
  ];

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground ${className}`}>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex items-center gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Easy Returns</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          <span>Fast Delivery</span>
        </div>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`space-y-3 ${className}`}>
        {badges.slice(0, 3).map((badge) => (
          <div key={badge.title} className="flex items-center gap-3 text-sm">
            <badge.icon className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <badge.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {badge.title}
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">
              {badge.description}
            </span>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      {showPaymentMethods && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            We accept
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {paymentMethods.map((method) => (
              <div
                key={method.name}
                className={`${method.bg} text-white text-[10px] font-bold px-2.5 py-1 rounded`}
              >
                {method.text}
              </div>
            ))}
            <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded">
              GPay
            </div>
            <div className="bg-[#5F259F] text-white text-[10px] font-bold px-2.5 py-1 rounded">
              PhonePe
            </div>
            <div className="bg-[#00BAF2] text-white text-[10px] font-bold px-2.5 py-1 rounded">
              Paytm
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Secured by Razorpay
            </span>
          </div>
        </div>
      )}

      {/* Delivery Partners */}
      {showDeliveryPartners && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Delivery Partners
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {deliveryPartners.map((partner) => (
              <span
                key={partner}
                className="text-xs font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustBadges;
