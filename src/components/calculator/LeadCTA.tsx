"use client";

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from '@/core/i18n/navigation';
// import { usePostHog } from 'posthog-js/react';

export function LeadCTA({ 
  zipCode,
  materialType,
  mid,
  low,
  high
}: { 
  zipCode?: string;
  materialType?: string;
  mid?: number;
  low?: number;
  high?: number;
}) {
  const t = useTranslations('Calculator');
  const router = useRouter();
  // const posthog = usePostHog();

  const handleCTAClick = () => {
    // if (posthog) {
    //   posthog.capture('calculator_cta_clicked', { zipCode });
    // }

    const params = new URLSearchParams();
    if (zipCode) params.set('zip', zipCode);
    if (materialType) params.set('material', materialType);
    if (mid) params.set('mid', String(mid));
    if (low) params.set('low', String(low));
    if (high) params.set('high', String(high));

    router.push(`/calculator/quote?${params.toString()}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8 border-primary/20 bg-primary/5 overflow-hidden">
      <CardContent className="p-8 text-center flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-3 text-foreground">
          {t('ctaTitle') || 'Is your estimate too high?'}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg">
          {t('ctaDesc') || "We can connect you with up to 3 local, vetted roofing professionals who will compete for your business and might beat this estimated price."}
        </p>

        <ul className="text-sm text-left space-y-2 mb-8 inline-block">
          <li className="flex items-center text-foreground/80">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            {t('ctaBenefit1') || '100% Free, no-obligation quotes'}
          </li>
          <li className="flex items-center text-foreground/80">
            <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
            {t('ctaBenefit2') || 'Local contractors near you'}
          </li>
        </ul>

        <Button size="lg" className="w-full sm:w-auto text-lg group" onClick={handleCTAClick}>
          {t('ctaButton') || 'Get Real Local Quotes'}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
