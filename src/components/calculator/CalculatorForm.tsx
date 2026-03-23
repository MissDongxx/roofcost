"use client";

import { useState } from 'react';
// Removed unused useForm
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { CalculatorInput } from '@/lib/calculator/pricing-engine';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import materialsRaw from '@/data/materials.json';

const materials = materialsRaw as Record<string, any>;

interface CalculatorFormProps {
  onCalculate: (result: any) => void;
}

export function CalculatorForm({ onCalculate }: CalculatorFormProps) {
  const t = useTranslations('Calculator');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CalculatorInput>({
    zipCode: '',
    areaSqft: 2000,
    materialType: 'asphalt_architectural',
    pitchFactor: 1.0,
    complexity: 'simple',
    includeTearoff: true
  });

  const handleChange = (field: keyof CalculatorInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.zipCode || !formData.areaSqft || !formData.materialType) {
      toast.error(t('missingFields') || 'Please fill in required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/calculator/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate');
      
      onCalculate(data.data);
      toast.success(t('calculationSuccess') || 'Estimated cost generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-primary/10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t('title') || 'Estimate Your Roof Cost'}</CardTitle>
        <CardDescription>{t('description') || 'Get an instant, localized roofing estimate based on recent market data.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="zipCode">{t('zipCode') || 'ZIP Code'}</Label>
              <Input
                id="zipCode"
                placeholder="e.g. 10001"
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                required
                maxLength={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaSqft">{t('areaSqft') || 'Roof Area (Sq Ft)'}</Label>
              <Input
                id="areaSqft"
                type="number"
                min="500"
                max="20000"
                value={formData.areaSqft}
                onChange={(e) => handleChange('areaSqft', parseInt(e.target.value))}
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialType">{t('materialType') || 'Roofing Material'}</Label>
            <Select 
              value={formData.materialType} 
              onValueChange={(val) => handleChange('materialType', val)}
            >
              <SelectTrigger id="materialType">
                <SelectValue placeholder="Select Material" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(materials).map(([key, mat]) => (
                  <SelectItem key={key} value={key}>
                    {mat.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="complexity">{t('complexity') || 'Roof Complexity'}</Label>
              <Select 
                value={formData.complexity} 
                onValueChange={(val) => handleChange('complexity', val)}
              >
                <SelectTrigger id="complexity">
                  <SelectValue placeholder="Select Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">{t('complexitySimple') || 'Simple (Gable, normal pitch)'}</SelectItem>
                  <SelectItem value="moderate">{t('complexityModerate') || 'Moderate (Some valleys/dormers)'}</SelectItem>
                  <SelectItem value="complex">{t('complexityComplex') || 'Complex (Many dormers/valleys, steep)'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pitchFactor">{t('pitch') || 'Steepness'}</Label>
              <Select
                value={formData.pitchFactor.toString()}
                onValueChange={(val) => handleChange('pitchFactor', parseFloat(val))}
              >
                <SelectTrigger id="pitchFactor">
                  <SelectValue placeholder="Select Pitch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">Low to Flat (Up to 3/12)</SelectItem>
                  <SelectItem value="1.1">Standard (4/12 to 7/12)</SelectItem>
                  <SelectItem value="1.25">Steep (8/12 and above)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="tearoff" className="text-base">{t('includeTearoff') || 'Remove Existing Roof?'}</Label>
              <p className="text-sm text-muted-foreground">{t('tearoffDesc') || 'Recommended if you already have 2 layers of shingles.'}</p>
            </div>
            <Switch
              id="tearoff"
              checked={formData.includeTearoff}
              onCheckedChange={(checked) => handleChange('includeTearoff', checked)}
            />
          </div>

          <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {t('calculateBtn') || 'Calculate My Cost'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
