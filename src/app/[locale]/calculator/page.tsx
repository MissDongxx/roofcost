"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultCard } from '@/components/calculator/ResultCard';
import { PriceBreakdown } from '@/components/calculator/PriceBreakdown';
import { LeadCTA } from '@/components/calculator/LeadCTA';
import { QuoteSubmitForm } from '@/components/calculator/QuoteSubmitForm';
import { PriceResult, CalculatorInput } from '@/lib/calculator/pricing-engine';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/components/ui/collapsible';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { ChevronDown, FileText, Loader2, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function CalculatorPage() {
  const t = useTranslations('Calculator');
  const [result, setResult] = useState<PriceResult | null>(null);
  const [inputData, setInputData] = useState<CalculatorInput | null>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // PDF email states
  const [email, setEmail] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  const handleCalculate = (data: PriceResult, input: CalculatorInput) => {
    setResult(data);
    setInputData(input);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };

  const handleSendPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setPdfLoading(true);
    try {
      const res = await fetch('/api/calculator/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, result, input: inputData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send PDF');
      
      toast.success('PDF sent! Please check your email.');
      setPdfDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error sending PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          {t('pageTitle') || 'Free Roof Cost Calculator'}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t('pageSubtitle') || 'Discover true roofing costs in your area. Enter your ZIP code and roof details for an instant, math-based estimate without the sales pressure.'}
        </p>
      </div>
      
      <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto">
        <section>
          {/* We must pass both result and the input state if possible.
              Wait, CalculatorForm previously only sent the result. I will update it to also send the input.
              Actually, CalculatorForm calls onCalculate(data.data), I should update CalculatorForm to do onCalculate(data.data, formData).
          */}
          <CalculatorForm onCalculate={handleCalculate as any} />
        </section>

        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultCard result={result} />
            <PriceBreakdown result={result} />
            
            <div className="flex justify-center mt-4">
              <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Download / Email PDF
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Estimate PDF</DialogTitle>
                    <DialogDescription>
                      Enter your email address to receive a detailed PDF breakdown of your roof cost estimate.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSendPdf} className="space-y-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={pdfLoading}>
                      {pdfLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Send PDF
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <LeadCTA 
              zipCode={inputData?.zipCode} 
              materialType={inputData?.materialType}
              mid={result?.mid}
              low={result?.low}
              high={result?.high}
            />

            <div className="mt-12 pt-12 border-t">
              <Collapsible open={isQuoteOpen} onOpenChange={setIsQuoteOpen} className="w-full">
                <div className="flex flex-col items-center">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="gap-2 font-semibold">
                      Share your actual contractor quote
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isQuoteOpen ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300">
                  <QuoteSubmitForm initialData={inputData} />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
