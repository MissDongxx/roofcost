import { Suspense } from 'react';
import { Metadata } from 'next';
import { QuoteClient } from './QuoteClient';

export const metadata: Metadata = {
  title: 'Get Free Local Roofing Quotes | RoofCostCalc',
  robots: { index: false, follow: false },
};

export default function QuotePage() {
  // Read from process.env (Server-side)
  const affiliateId = process.env.HOMEADVISOR_AFFILIATE_ID || process.env.NEXT_PUBLIC_HOMEADVISOR_AFFILIATE_ID || '';

  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-muted-foreground">Loading quote details...</div>}>
      <QuoteClient affiliateId={affiliateId} />
    </Suspense>
  );
}
