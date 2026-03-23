"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import materialsRaw from '@/data/materials.json';

const materials = materialsRaw as Record<string, any>;

export function QuoteSubmitForm() {
  const t = useTranslations('Calculator');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    city: '',
    stateCode: '',
    zipCode: '',
    materialType: 'asphalt_architectural',
    areaSqft: '',
    actualQuote: '',
    quoteDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.stateCode || !formData.actualQuote || !formData.materialType) {
      toast.error(t('missingQuoteFields') || 'Please fill in required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/calculator/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          areaSqft: formData.areaSqft ? parseInt(formData.areaSqft) : null,
          actualQuote: parseInt(formData.actualQuote),
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      
      setSuccess(true);
      toast.success(t('quoteSubmitSuccess') || 'Thank you for sharing your quote data!');
    } catch (error: any) {
      toast.error(error.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-xl mx-auto border-green-500/30 bg-green-50/50">
        <CardContent className="p-8 text-center text-green-800">
          <h3 className="text-xl font-bold mb-2">{t('thankYou') || 'Thank You!'}</h3>
          <p>{t('quoteSubmitThanksDesc') || 'Your anonymous data helps keeping our calculator accurate for everyone.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-md border-border">
      <CardHeader>
        <CardTitle>{t('submitQuoteTitle') || 'Help Improve Our Estimates'}</CardTitle>
        <CardDescription>{t('submitQuoteDesc') || 'Recently got a roof replacement quote? Share it anonymously to help others get accurate estimates.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t('city') || 'City'}</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateCode">{t('stateCode') || 'State (e.g. CA)'}</Label>
              <Input
                id="stateCode"
                maxLength={2}
                value={formData.stateCode}
                onChange={(e) => handleChange('stateCode', e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zipCode">{t('zipCode') || 'ZIP Code (Optional)'}</Label>
              <Input
                id="zipCode"
                maxLength={5}
                value={formData.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qMaterialType">{t('materialType') || 'Material'}</Label>
              <Select 
                value={formData.materialType} 
                onValueChange={(val) => handleChange('materialType', val)}
              >
                <SelectTrigger id="qMaterialType">
                  <SelectValue placeholder="Material" />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qAreaSqft">{t('areaSqft') || 'Roof Area (Optional)'}</Label>
              <Input
                id="qAreaSqft"
                type="number"
                value={formData.areaSqft}
                onChange={(e) => handleChange('areaSqft', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actualQuote">{t('actualQuote') || 'Total Quote Price ($)'}</Label>
              <Input
                id="actualQuote"
                type="number"
                min="1000"
                value={formData.actualQuote}
                onChange={(e) => handleChange('actualQuote', e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t('submitBtn') || 'Submit Data Anonymously'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
