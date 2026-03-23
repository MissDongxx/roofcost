"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultCard } from '@/components/calculator/ResultCard';
import { PriceBreakdown } from '@/components/calculator/PriceBreakdown';
import { LeadCTA } from '@/components/calculator/LeadCTA';
import { PriceResult } from '@/lib/calculator/pricing-engine';

export default function CalculatorPage() {
  const t = useTranslations('Calculator');
  const [result, setResult] = useState<PriceResult | null>(null);

  const handleCalculate = (data: PriceResult) => {
    setResult(data);
    
    // Scroll to results smoothly
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {t('pageTitle') || 'Free Roof Cost Calculator'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pageSubtitle') || 'Discover true roofing costs in your area. Enter your ZIP code and roof details for an instant, math-based estimate without the sales pressure.'}
        </p>
      </div>
      
      <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto">
        {/* The Input Form */}
        <section>
          <CalculatorForm onCalculate={handleCalculate} />
        </section>

        {/* The Results Section */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultCard result={result} />
            <PriceBreakdown result={result} />
            <LeadCTA />
          </section>
        )}
      </div>
    </div>
  );
}
