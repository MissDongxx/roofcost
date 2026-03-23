"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface QuoteClientProps {
  affiliateId: string;
}

export function QuoteClient({ affiliateId }: QuoteClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const zip = searchParams.get('zip') || '';
  const material = searchParams.get('material') || '';
  const mid = searchParams.get('mid') || '';
  const low = searchParams.get('low') || '';
  const high = searchParams.get('high') || '';

  // Format currency
  const formatCurrency = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formattedLow = formatCurrency(low);
  const formattedHigh = formatCurrency(high);

  const handleCTA = () => {
    // Call PostHog tracking if available globally
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('affiliate_redirect', { 
        zip, 
        material, 
        mid_price: mid 
      });
    }

    // Redirect to HomeAdvisor
    const targetUrl = new URL('https://www.homeadvisor.com/task.html');
    if (zip) targetUrl.searchParams.set('zip', zip);
    targetUrl.searchParams.set('utm_source', 'roofcostcalc');
    targetUrl.searchParams.set('utm_medium', 'quote_page');
    targetUrl.searchParams.set('utm_campaign', 'local_quotes');
    if (affiliateId) targetUrl.searchParams.set('ref', affiliateId);

    window.location.href = targetUrl.toString();
  };

  const backUrl = `/calculator/result?${searchParams.toString()}`;

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
          Get Free Quotes from Local Roofing Contractors
        </h1>
        {formattedLow && formattedHigh && (
          <p className="text-xl md:text-2xl text-primary font-semibold mb-2">
            Your estimate: ${formattedLow} – ${formattedHigh}
          </p>
        )}
        {zip && (
          <p className="text-sm text-muted-foreground font-medium">
            ZIP Code: {zip}
          </p>
        )}
      </div>

      <Card className="w-full max-w-2xl border-primary/20 bg-card shadow-lg mb-8">
        <CardContent className="p-8 md:p-10 flex flex-col items-center text-center">
          <ul className="text-left space-y-4 mb-10 w-full max-w-md mx-auto">
            <li className="flex items-start">
              <CheckCircle2 className="w-6 h-6 mr-3 text-green-500 shrink-0" />
              <span className="text-lg font-medium text-foreground/90">
                100% Free — no obligation, no credit card
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-6 h-6 mr-3 text-green-500 shrink-0" />
              <span className="text-lg font-medium text-foreground/90">
                Up to 3 vetted local contractors will contact you
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="w-6 h-6 mr-3 text-green-500 shrink-0" />
              <span className="text-lg font-medium text-foreground/90">
                Contractors compete for your business — you save more
              </span>
            </li>
          </ul>

          <Button 
            size="lg" 
            className="w-full sm:w-auto text-xl py-6 px-8 group font-bold" 
            onClick={handleCTA}
          >
            Connect Me with Local Contractors
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>

      <div className="text-center space-y-6 flex flex-col items-center">
        <p className="text-sm">
          <span className="text-muted-foreground mr-2">Not ready yet?</span>
          <Link href={backUrl} className="text-primary hover:underline font-medium">
            ← Back to your estimate
          </Link>
        </p>

        <p className="text-xs text-muted-foreground max-w-xl">
          RoofCostCalc may receive compensation when you connect with contractors. This does not affect our estimates.
        </p>
      </div>
    </div>
  );
}
