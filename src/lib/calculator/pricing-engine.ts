import geoDataRaw from '@/data/geo-cost-index.json';
import materialsDataRaw from '@/data/materials.json';

const MATERIALS: Record<string, any> = materialsDataRaw;
const GEO_DATA: Record<string, any> = geoDataRaw;

export interface CalculatorInput {
  zipCode: string;
  areaSqft: number;
  materialType: string;
  pitchFactor: number;
  complexity: 'simple' | 'moderate' | 'complex';
  includeTearoff: boolean;
}

export interface PriceResult {
  low: number;
  mid: number;
  high: number;
  breakdown: {
    materialCost: number;
    laborCost: number;
    tearoffCost: number;
    disposalCost: number;
    permitCost: number;
  };
  geoIndex: number;
  isDefaultGeo: boolean;
  materialName: string;
}

export async function getGeoIndex(zipCode: string) {
  const geo = GEO_DATA[zipCode] || GEO_DATA["__default__"];
  return {
    labor_cost_index: geo.labor_cost_index,
    material_index: geo.material_index,
    isDefault: !GEO_DATA[zipCode]
  };
}

export async function calculateRoofCost(input: CalculatorInput): Promise<PriceResult> {
  const geo = await getGeoIndex(input.zipCode);
  const material = MATERIALS[input.materialType];

  if (!material) throw new Error(`Unknown material: ${input.materialType}`);

  const effectiveArea = input.areaSqft * input.pitchFactor;
  const complexityMultiplier = { simple: 1.0, moderate: 1.12, complex: 1.25 }[input.complexity] || 1.0;

  const materialCostMid = effectiveArea * material.price_mid_sqft * geo.material_index;

  const LABOR_BASE_PER_SQFT = 2.75;
  const laborCostMid = effectiveArea * LABOR_BASE_PER_SQFT * geo.labor_cost_index * complexityMultiplier;

  const tearoffCost = input.includeTearoff ? effectiveArea * 1.20 * geo.labor_cost_index : 0;
  const disposalCost = input.includeTearoff ? (400 + effectiveArea * 0.10) : 0;
  const permitCost = 250;

  const midTotal = Math.round(materialCostMid + laborCostMid + tearoffCost + disposalCost + permitCost);

  const low = Math.round(midTotal * (material.price_low_sqft / material.price_mid_sqft) * 0.9);
  const high = Math.round(midTotal * (material.price_high_sqft / material.price_mid_sqft) * 1.1);

  return {
    low,
    mid: midTotal,
    high,
    breakdown: {
      materialCost: Math.round(materialCostMid),
      laborCost: Math.round(laborCostMid),
      tearoffCost: Math.round(tearoffCost),
      disposalCost: Math.round(disposalCost),
      permitCost,
    },
    geoIndex: geo.labor_cost_index,
    isDefaultGeo: geo.isDefault,
    materialName: material.display_name,
  };
}
