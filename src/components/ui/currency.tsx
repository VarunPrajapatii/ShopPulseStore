'use client';

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

interface CurrencyProps {
  amount?: string | number;
  className?: string;
}

const Currency: React.FC<CurrencyProps> = ({ amount, className }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  return <span className={cn("font-bold text-foreground", className)}>{formatter.format(Number(amount))}</span>;
};

export default Currency;
