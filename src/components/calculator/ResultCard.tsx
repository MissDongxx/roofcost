"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { PriceResult } from '@/lib/calculator/pricing-engine';

export function ResultCard({ result }: { result: PriceResult }) {
  const t = useTranslations('Calculator');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-gradient-to-b from-primary/5 to-background border-primary/20">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-extrabold text-foreground">
          {t('estimatedCost') || 'Estimated Roof Cost'}
        </CardTitle>
        <CardDescription className="text-base mt-2">
          {t('estimatedSubtitle', { material: result.materialName }) || `Based on local rates for ${result.materialName}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-sm tracking-widest text-muted-foreground uppercase font-bold">
            {t('estimatedCostRange') || 'ESTIMATED COST RANGE'}
          </div>
          <div className="text-4xl md:text-5xl font-black text-primary drop-shadow-sm flex items-center justify-center gap-2 md:gap-4 flex-wrap">
            <span>{formatCurrency(result.low)}</span>
            <span className="text-2xl md:text-3xl text-primary/50">-</span>
            <span>{formatCurrency(result.high)}</span>
          </div>
          <div className="flex flex-col items-center mt-6 p-4 rounded-xl bg-muted/30 w-full">
            <span className="text-sm text-muted-foreground uppercase font-semibold mb-1">
              {t('averageCost') || 'AVG EXPECTED COST'}
            </span>
            <span className="text-3xl font-bold opacity-80">{formatCurrency(result.mid)}</span>
          </div>
          {result.isDefaultGeo && (
            <div className="text-xs text-amber-600 bg-amber-100/50 p-2 rounded w-full text-center mt-4">
              {t('geoDefaultWarning') || 'Using national average rates. Local rates may vary.'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
