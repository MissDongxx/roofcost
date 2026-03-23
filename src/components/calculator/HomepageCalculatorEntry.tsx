"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const popularCities = [
  { name: 'Houston', href: '/roof-cost/texas/houston' },
  { name: 'Los Angeles', href: '/roof-cost/california/los-angeles' },
  { name: 'Chicago', href: '/roof-cost/illinois/chicago' },
  { name: 'Phoenix', href: '/roof-cost/arizona/phoenix' },
  { name: 'Dallas', href: '/roof-cost/texas/dallas' },
  { name: 'Miami', href: '/roof-cost/florida/miami' },
  { name: 'Atlanta', href: '/roof-cost/georgia/atlanta' },
  { name: 'Denver', href: '/roof-cost/colorado/denver' },
];

interface HomepageCalculatorEntryProps {
  locale?: string;
}

export function HomepageCalculatorEntry({ locale = '' }: HomepageCalculatorEntryProps) {
  const router = useRouter();
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      router.push(`/${locale}/calculator?zip=${zip}`);
    } else {
      setError('Please enter a valid 5-digit ZIP code');
    }
  };

  const handleZipChange = (value: string) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, '').slice(0, 5);
    setZip(numericValue);
    setError('');
  };

  return (
    <section className="py-16 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-foreground">
              Get Your Free Roof Estimate
            </h2>
            <p className="text-base text-muted-foreground">
              Free · No signup required · Instant estimate
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-10">
            <div className="flex-1">
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Enter your ZIP code (e.g. 90210)"
                value={zip}
                onChange={(e) => handleZipChange(e.target.value)}
                className="h-12 text-base px-4"
                maxLength={5}
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>
            <Button type="submit" className="h-12 px-6 font-semibold text-base whitespace-nowrap">
              Get My Estimate
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm font-semibold text-foreground mb-3">
              Popular cities:
            </p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              {popularCities.map((city) => (
                <Link
                  key={city.name}
                  href={`/${locale}${city.href}`}
                  className="hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30 hover:decoration-primary"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
