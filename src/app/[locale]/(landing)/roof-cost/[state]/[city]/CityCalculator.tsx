"use client";

import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { useRouter } from '@/core/i18n/navigation';
import { PriceResult, CalculatorInput } from '@/lib/calculator/pricing-engine';

interface CityCalculatorProps {
  defaultZip: string;
}

export function CityCalculator({ defaultZip }: CityCalculatorProps) {
  const router = useRouter();

  const handleCalculate = (result: PriceResult, input: CalculatorInput) => {
    // Navigate to result page with query parameters
    const params = new URLSearchParams({
      zip: input.zipCode,
      material: input.materialType,
      areaSqft: input.areaSqft.toString(),
      mid: result.mid.toString(),
      low: result.low.toString(),
      high: result.high.toString(),
      materialCost: result.breakdown.materialCost.toString(),
      laborCost: result.breakdown.laborCost.toString(),
      tearoffCost: result.breakdown.tearoffCost.toString(),
      disposalCost: result.breakdown.disposalCost.toString(),
      permitCost: result.breakdown.permitCost.toString(),
      geoIndex: result.geoIndex.toString(),
      isDefaultGeo: result.isDefaultGeo.toString(),
      materialName: result.materialName,
    });

    router.push(`/calculator/result?${params.toString()}`);
  };

  return <CalculatorForm defaultZip={defaultZip} onCalculate={handleCalculate} />;
}
