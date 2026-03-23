"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { PriceResult } from '@/lib/calculator/pricing-engine';

export function PriceBreakdown({ result }: { result: PriceResult }) {
  const t = useTranslations('Calculator');
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const { materialCost, laborCost, tearoffCost, disposalCost, permitCost } = result.breakdown;
  const total = materialCost + laborCost + tearoffCost + disposalCost + permitCost;

  const BreakdownRow = ({ label, value, percent }: { label: string, value: number, percent: number }) => (
    <div className="flex justify-between flex-row items-center py-2 border-b border-border/50 last:border-0 hover:bg-muted/30 px-2 rounded-sm transition-colors">
      <div className="flex flex-col">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{percent.toFixed(1)}% of total</span>
      </div>
      <span className="font-semibold">{formatCurrency(value)}</span>
    </div>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-md border-primary/5 mt-6">
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="breakdown" className="border-none">
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/10">
              <span className="font-bold text-lg text-primary">
                {t('viewBreakdown') || 'View Cost Breakdown'}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="space-y-1">
                <BreakdownRow 
                  label={t('materialCost') || 'Base Materials'} 
                  value={materialCost} 
                  percent={(materialCost / total) * 100} 
                />
                <BreakdownRow 
                  label={t('laborCost') || 'Installation Labor'} 
                  value={laborCost} 
                  percent={(laborCost / total) * 100} 
                />
                {tearoffCost > 0 && (
                  <BreakdownRow 
                    label={t('tearoffCost') || 'Old Roof Tear-off'} 
                    value={tearoffCost} 
                    percent={(tearoffCost / total) * 100} 
                  />
                )}
                {disposalCost > 0 && (
                  <BreakdownRow 
                    label={t('disposalCost') || 'Disposal & Dumpster'} 
                    value={disposalCost} 
                    percent={(disposalCost / total) * 100} 
                  />
                )}
                <BreakdownRow 
                  label={t('permitCost') || 'Permits & Fees'} 
                  value={permitCost} 
                  percent={(permitCost / total) * 100} 
                />
                <div className="flex justify-between pt-4 mt-2 border-t border-border font-bold text-lg">
                  <span>{t('totalEstimate') || 'Total Estimate'}</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
