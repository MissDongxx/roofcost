"use client";

import React from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ArrowRight, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CalculatorCTAProps {
  locale?: string;
  title?: string;
  description?: string;
}

export function CalculatorCTA({
  locale = '',
  title = "Get Your Free Roof Replacement Estimate",
  description = "Enter your ZIP code to get an instant estimate for your roof replacement."
}: CalculatorCTAProps) {
  const router = useRouter();
  const [zip, setZip] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      router.push(`/${locale}/calculator?zip=${zip}`);
    } else {
      setError('Please enter a valid 5-digit ZIP code');
    }
  };

  const handleZipChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 5);
    setZip(numericValue);
    setError('');
  };

  return (
    <section className="my-8 rounded-lg border bg-primary/5 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Calculator className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
      </div>

      <p className="text-muted-foreground mb-6">{description}</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="flex-1">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="Enter your ZIP code (e.g. 90210)"
            value={zip}
            onChange={(e) => handleZipChange(e.target.value)}
            className="h-11 text-base"
            maxLength={5}
          />
          {error && (
            <p className="text-destructive text-sm mt-2">{error}</p>
          )}
        </div>
        <Button type="submit" className="h-11 px-6 font-semibold">
          Get My Estimate
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </form>

      <p className="text-xs text-muted-foreground mt-4">
        Free · No signup required · Instant estimate
      </p>
    </section>
  );
}
