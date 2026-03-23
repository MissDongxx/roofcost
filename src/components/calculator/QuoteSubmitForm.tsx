"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import materialsRaw from '@/data/materials.json';
import { CalculatorInput } from '@/lib/calculator/pricing-engine';

const materials = materialsRaw as Record<string, any>;

interface QuoteSubmitFormProps {
  initialData?: CalculatorInput | null;
  standalone?: boolean;
}

export function QuoteSubmitForm({ initialData, standalone = true }: QuoteSubmitFormProps) {
  const t = useTranslations('Calculator');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    city: '',
    stateCode: '',
    zipCode: initialData?.zipCode || '',
    materialType: initialData?.materialType || 'asphalt_architectural',
    areaSqft: initialData?.areaSqft ? initialData.areaSqft.toString() : '',
    actualQuote: '',
    quoteDate: new Date().toISOString().split('T')[0],
  });

  // Watch for zipCode changes to autofill state
  useEffect(() => {
    if (formData.zipCode.length === 5) {
      fetch(`/api/calculator/geo?zip=${formData.zipCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.state_code) {
            setFormData(prev => ({ 
              ...prev, 
              stateCode: data.state_code,
              city: prev.city || data.metro_area || ''
            }));
          }
        })
        .catch(() => {});
    }
  }, [formData.zipCode]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const [dateFields, setDateFields] = useState({
    month: (new Date().getMonth() + 1).toString(),
    day: new Date().getDate().toString(),
    year: new Date().getFullYear().toString(),
  });

  const MONTHS = [
    { name: "January", value: "1" },
    { name: "February", value: "2" },
    { name: "March", value: "3" },
    { name: "April", value: "4" },
    { name: "May", value: "5" },
    { name: "June", value: "6" },
    { name: "July", value: "7" },
    { name: "August", value: "8" },
    { name: "September", value: "9" },
    { name: "October", value: "10" },
    { name: "November", value: "11" },
    { name: "December", value: "12" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.stateCode || !formData.actualQuote || !formData.materialType) {
      toast.error(t('missingQuoteFields') || 'Please fill in required fields.');
      return;
    }

    const formattedDate = `${dateFields.year}-${dateFields.month.padStart(2, '0')}-${dateFields.day.padStart(2, '0')}`;

    setLoading(true);
    try {
      const res = await fetch('/api/calculator/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          areaSqft: formData.areaSqft ? parseInt(formData.areaSqft) : null,
          actualQuote: parseInt(formData.actualQuote),
          quoteDate: formattedDate,
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
      <Card className={`w-full max-w-xl mx-auto border-green-500/30 bg-green-50/50 ${!standalone ? 'border-none shadow-none bg-transparent' : ''}`}>
        <CardContent className="p-8 text-center text-green-800">
          <h3 className="text-xl font-bold mb-2">{t('thankYou') || 'Thank You!'}</h3>
          <p>{t('quoteSubmitThanksDesc') || 'Your anonymous data helps keeping our calculator accurate for everyone.'}</p>
        </CardContent>
      </Card>
    );
  }

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <Label htmlFor="city">{t('city') || 'City'}</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            required
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
          <Label>Quote Date</Label>
          <div className="flex gap-2">
            <div className="flex-[2]">
              <Select
                value={dateFields.month}
                onValueChange={(val) => setDateFields(prev => ({ ...prev, month: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                placeholder="DD"
                maxLength={2}
                value={dateFields.day}
                onChange={(e) => setDateFields(prev => ({ ...prev, day: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="YYYY"
                maxLength={4}
                value={dateFields.year}
                onChange={(e) => setDateFields(prev => ({ ...prev, year: e.target.value.replace(/\D/g, '') }))}
                required
              />
            </div>
          </div>
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
  );

  if (!standalone) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          {t('submitQuoteDesc') || 'Recently got a roof replacement quote? Share it anonymously to help others get accurate estimates.'}
        </p>
        {FormContent}
      </div>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-md border-border">
      <CardHeader>
        <CardTitle>{t('submitQuoteTitle') || 'Help Improve Our Estimates'}</CardTitle>
        <CardDescription>{t('submitQuoteDesc') || 'Recently got a roof replacement quote? Share it anonymously to help others get accurate estimates.'}</CardDescription>
      </CardHeader>
      <CardContent>
        {FormContent}
      </CardContent>
    </Card>
  );
}
