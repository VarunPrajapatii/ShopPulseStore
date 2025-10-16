'use client';

import { useEffect, useState } from "react";

export const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

interface CurrencyProps {
  amount?: string | number;
}

const Currency: React.FC<CurrencyProps> = ({ amount }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  
  return <span className="font-bold">{formatter.format(Number(amount))}</span>;
};

export default Currency;
