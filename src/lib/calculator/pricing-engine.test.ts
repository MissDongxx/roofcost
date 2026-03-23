import { describe, it, expect } from 'vitest';
import { calculateRoofCost, getGeoIndex } from './pricing-engine';

describe('Pricing Engine', () => {
  it('should return default geo index for unknown ZIP', async () => {
    const geo = await getGeoIndex('00000');
    expect(geo.isDefault).toBe(true);
    expect(geo.labor_cost_index).toBe(1.000);
  });

  it('should return specific geo index for NY 10001', async () => {
    const geo = await getGeoIndex('10001');
    expect(geo.isDefault).toBe(false);
    expect(geo.labor_cost_index).toBe(1.42);
    expect(geo.material_index).toBe(1.18);
  });

  it('should calculate cost properly for simple asphalt roof', async () => {
    const result = await calculateRoofCost({
      zipCode: '10001',
      areaSqft: 2000,
      materialType: 'asphalt_3tab',
      pitchFactor: 1.0,
      complexity: 'simple',
      includeTearoff: true
    });

    expect(result.materialName).toBe('Asphalt 3-Tab Shingles');
    expect(result.isDefaultGeo).toBe(false);
    expect(result.geoIndex).toBe(1.42);
    
    // Check calculations
    // effectiveArea = 2000 * 1.0 = 2000
    // complexityMultiplier = 1.0
    // materialCostMid = 2000 * 4.5 * 1.18 = 10620
    // laborCostMid = 2000 * 2.75 * 1.42 * 1.0 = 7810
    // tearoffCost = 2000 * 1.20 * 1.42 = 3408
    // disposalCost = 400 + 2000 * 0.10 = 600
    // permitCost = 250
    // midTotal = 10620 + 7810 + 3408 + 600 + 250 = 22688
    
    expect(result.breakdown.materialCost).toBe(10620);
    expect(result.breakdown.laborCost).toBe(7810);
    expect(result.breakdown.tearoffCost).toBe(3408);
    expect(result.breakdown.disposalCost).toBe(600);
    expect(result.breakdown.permitCost).toBe(250);
    expect(result.mid).toBe(22688);
    
    // low = 22688 * (3.5/4.5) * 0.9 = 15882
    // high = 22688 * (5.5/4.5) * 1.1 = 30489
    expect(result.low).toBeGreaterThan(10000);
    expect(result.high).toBeGreaterThan(result.mid);
  });

  it('should throw error for unknown material', async () => {
    await expect(calculateRoofCost({
      zipCode: '10001',
      areaSqft: 2000,
      materialType: 'unknown_material',
      pitchFactor: 1.0,
      complexity: 'simple',
      includeTearoff: true
    })).rejects.toThrow('Unknown material: unknown_material');
  });
});
