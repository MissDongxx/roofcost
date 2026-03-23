"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { CalculatorInput } from '@/lib/calculator/pricing-engine';
import materialsRaw from '@/data/materials.json';

const materials = materialsRaw as Record<string, any>;

interface CalculatorFormProps {
  onCalculate: (result: any, input: CalculatorInput) => void;
  defaultZip?: string;
}

export function CalculatorForm({ onCalculate, defaultZip }: CalculatorFormProps) {
  const t = useTranslations('Calculator');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<CalculatorInput>({
    zipCode: defaultZip || '',
    areaSqft: 2000,
    materialType: 'asphalt_architectural',
    pitchFactor: 1.1, // Default to Low (4/12)
    complexity: 'simple',
    includeTearoff: true
  });

  const [locationStr, setLocationStr] = useState<string>('');
  const [fetchingGeo, setFetchingGeo] = useState(false);

  const handleChange = (field: keyof CalculatorInput, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (formData.zipCode.length === 5) {
      setFetchingGeo(true);
      fetch(`/api/calculator/geo?zip=${formData.zipCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.state_code) {
            setLocationStr(`${data.metro_area}, ${data.state_code}`);
          } else {
            setLocationStr('');
          }
        })
        .catch(() => setLocationStr(''))
        .finally(() => setFetchingGeo(false));
    } else {
      setLocationStr('');
    }
  }, [formData.zipCode]);

  const handleSubmit = async () => {
    if (!formData.zipCode || !formData.areaSqft || !formData.materialType) {
      toast.error(t('missingFields') || 'Please fill in required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/calculator/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to calculate');
      
      onCalculate(data.data, formData);
      toast.success(t('calculationSuccess') || 'Estimated cost generated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.zipCode || formData.zipCode.length < 5 || formData.areaSqft < 500)) {
      toast.error('Please enter a valid 5-digit ZIP code and an area >= 500 sqft.');
      return;
    }
    setStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const steps = [
    { num: 1, label: t('step1Label') || 'Property Details' },
    { num: 2, label: t('step2Label') || 'Material' },
    { num: 3, label: t('step3Label') || 'Complexity' },
    { num: 4, label: t('step4Label') || 'Summary' }
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl border-primary/10">
      <CardHeader className="bg-muted/20 border-b pb-6">
        <div className="flex justify-between items-center mb-6">
          {steps.map((s, i) => (
            <div 
              key={s.num} 
              className="flex flex-col items-center cursor-pointer transition-opacity"
              style={{ opacity: step >= s.num ? 1 : 0.4 }}
              onClick={() => {
                if (s.num < step) setStep(s.num);
              }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors duration-300 ${
                step >= s.num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs font-semibold ${step >= s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <CardTitle className="text-2xl font-bold">
          {step === 1 && (t('step1Title') || 'Location & Size')}
          {step === 2 && (t('step2Title') || 'Roofing Material')}
          {step === 3 && (t('step3Title') || 'Complexity & Tear-off')}
          {step === 4 && (t('step4Title') || 'Review Your Details')}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-8">
        <div className="min-h-[300px]">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2 relative">
                <Label htmlFor="zipCode" className="text-base">{t('zipCode') || 'ZIP Code'}</Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    placeholder="e.g. 10001"
                    value={formData.zipCode}
                    onChange={(e) => handleChange('zipCode', e.target.value)}
                    required
                    maxLength={5}
                    className="w-full text-lg py-6 pr-32"
                  />
                  {fetchingGeo ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : locationStr ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-green-600 truncate max-w-[120px]">
                      ✓ {locationStr}
                    </div>
                  ) : formData.zipCode.length === 5 ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground truncate max-w-[120px]">
                      Not Found
                    </div>
                  ) : null}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="areaSqft" className="text-base">{t('areaSqft') || 'Roof Area (Sq Ft)'}</Label>
                <Input
                  id="areaSqft"
                  type="number"
                  min="500"
                  max="20000"
                  value={formData.areaSqft}
                  onChange={(e) => handleChange('areaSqft', parseInt(e.target.value) || 0)}
                  required
                  className="w-full text-lg py-6"
                />
                <p className="text-sm text-muted-foreground">{t('areaDesc') || 'Average US roof is approx 1,700 - 2,000 sq ft.'}</p>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(materials).map(([key, mat]) => {
                const isSelected = formData.materialType === key;
                return (
                  <div 
                    key={key}
                    onClick={() => handleChange('materialType', key)}
                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                      isSelected ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg leading-tight">{mat.display_name}</h4>
                      {isSelected && <CheckCircle2 className="text-primary w-5 h-5 shrink-0 ml-2" />}
                    </div>
                    <p className="text-primary font-semibold mb-1">
                      ${mat.price_low_sqft.toFixed(2)} - ${mat.price_high_sqft.toFixed(2)} / sqft
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {mat.description}
                    </p>
                    <div className="text-xs font-medium px-2 py-1 bg-muted rounded inline-block">
                      Lifespan: {mat.lifespan_years} Years
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label htmlFor="complexity" className="text-base">{t('complexity') || 'Roof Complexity'}</Label>
                <Select 
                  value={formData.complexity} 
                  onValueChange={(val) => handleChange('complexity', val)}
                >
                  <SelectTrigger id="complexity" className="py-6 text-lg">
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
                <Label htmlFor="pitchFactor" className="text-base">{t('pitch') || 'Steepness'}</Label>
                <Select
                  value={formData.pitchFactor.toString()}
                  onValueChange={(val) => handleChange('pitchFactor', parseFloat(val))}
                >
                  <SelectTrigger id="pitchFactor" className="py-6 text-lg">
                    <SelectValue placeholder="Select Pitch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Flat (1/12–2/12)</SelectItem>
                    <SelectItem value="1.1">Low (3/12–5/12)</SelectItem>
                    <SelectItem value="1.2">Medium (6/12–9/12)</SelectItem>
                    <SelectItem value="1.4">Steep (10/12+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                <div className="space-y-0.5">
                  <Label htmlFor="tearoff" className="text-base">{t('includeTearoff') || 'Remove Existing Roof?'}</Label>
                  <p className="text-sm text-muted-foreground">{t('tearoffDesc') || 'Recommended if replacing old shingles.'}</p>
                </div>
                <Switch
                  id="tearoff"
                  checked={formData.includeTearoff}
                  onCheckedChange={(checked) => handleChange('includeTearoff', checked)}
                />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-muted/30 p-6 rounded-xl border border-border space-y-4 text-sm md:text-base">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold">{formData.zipCode} {locationStr ? `(${locationStr})` : ''}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Roof Area:</span>
                  <span className="font-semibold">{formData.areaSqft} sqft</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Material:</span>
                  <span className="font-semibold">{materials[formData.materialType]?.display_name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Complexity:</span>
                  <span className="font-semibold capitalize">{formData.complexity}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Steepness Factor:</span>
                  <span className="font-semibold">
                    {{
                      1: 'Flat (1/12–2/12)',
                      1.1: 'Low (3/12–5/12)',
                      1.2: 'Medium (6/12–9/12)',
                      1.4: 'Steep (10/12+)'
                    }[formData.pitchFactor] || formData.pitchFactor}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground">Remove Old Roof:</span>
                  <span className="font-semibold">{formData.includeTearoff ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8 pt-6 border-t border-border">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} className="w-full sm:w-1/3 py-6" type="button">
              <ArrowLeft className="mr-2 w-4 h-4" /> {t('backBtn') || 'Back'}
            </Button>
          )}
          
          {step < 4 ? (
            <Button onClick={nextStep} className="w-full py-6 flex-1" type="button">
              {t('nextBtn') || 'Next'} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full py-6 text-lg flex-1" disabled={loading} type="button">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              {t('calculateBtn') || 'Calculate My Cost'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
