"use client";

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { Loader2 } from 'lucide-react';

function CalculatorContent() {
  const t = useTranslations('Calculator');

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
        <section>
          <CalculatorForm />
        </section>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <CalculatorContent />
    </Suspense>
  );
}
