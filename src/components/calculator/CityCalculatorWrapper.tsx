"use client";

import { useState } from 'react';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultCard } from '@/components/calculator/ResultCard';
import { PriceBreakdown } from '@/components/calculator/PriceBreakdown';
import { LeadCTA } from '@/components/calculator/LeadCTA';
import { PriceResult } from '@/lib/calculator/pricing-engine';

export function CityCalculatorWrapper({ defaultZip }: { defaultZip: string }) {
  const [result, setResult] = useState<PriceResult | null>(null);

  // In a real app we'd pass defaultZip into CalculatorForm to override initial state,
  // but for the MVP the form manages its own state. We can still pass it down if we modify CalculatorForm.

  return (
    <div className="space-y-12">
      <CalculatorForm onCalculate={setResult} />
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <ResultCard result={result} />
          <PriceBreakdown result={result} />
          <LeadCTA zipCode={defaultZip} />
        </div>
      )}
    </div>
  );
}
