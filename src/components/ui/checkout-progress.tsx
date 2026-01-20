"use client";

import { Check, MapPin, CreditCard, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckoutStep = "address" | "verification" | "payment" | "done";

interface CheckoutProgressProps {
  currentStep: CheckoutStep;
  className?: string;
}

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({
  currentStep,
  className = "",
}) => {
  const steps = [
    { id: "address" as const, label: "Address", icon: MapPin },
    { id: "verification" as const, label: "Verify", icon: CheckCircle },
    { id: "payment" as const, label: "Payment", icon: CreditCard },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={cn("py-6", className)}>
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isCompleted && "bg-success text-success-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                <span
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && "text-success",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-20 md:w-24 h-1 mx-2 rounded-full transition-colors duration-300",
                    index < currentIndex ? "bg-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutProgress;
