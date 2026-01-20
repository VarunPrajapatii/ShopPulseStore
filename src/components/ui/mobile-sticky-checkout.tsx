"use client";

import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface MobileStickyCheckoutProps {
  total: number;
  onAction: () => void;
  actionLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  showSecure?: boolean;
  className?: string;
}

const MobileStickyCheckout: React.FC<MobileStickyCheckoutProps> = ({
  total,
  onAction,
  actionLabel = "Proceed to Checkout",
  isLoading = false,
  disabled = false,
  showSecure = true,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 lg:hidden z-50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 max-w-screen-sm mx-auto">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total Amount</span>
          <span className="text-xl font-bold">{formatPrice(total)}</span>
        </div>
        <Button
          onClick={onAction}
          disabled={disabled || isLoading}
          className="flex-1 max-w-[200px] gap-2 h-12"
        >
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <>
              {showSecure && <Lock className="h-4 w-4" />}
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MobileStickyCheckout;
