"use client";

import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { useRouter } from '@/core/i18n/navigation';
import { PriceResult, CalculatorInput } from '@/lib/calculator/pricing-engine';

interface CityCalculatorProps {
  defaultZip: string;
}

export function CityCalculator({ defaultZip }: CityCalculatorProps) {
  const router = useRouter();

  const handleCalculate = (result: PriceResult, input: CalculatorInput) => {
    // No longer need manual redirect here as CalculatorForm handles it
  };

  return <CalculatorForm defaultZip={defaultZip} onCalculate={handleCalculate} />;
}
