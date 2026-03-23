"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ResultCard } from '@/components/calculator/ResultCard';
import { PriceBreakdown } from '@/components/calculator/PriceBreakdown';
import { LeadCTA } from '@/components/calculator/LeadCTA';
import { QuoteSubmitForm } from '@/components/calculator/QuoteSubmitForm';
import { PriceResult, CalculatorInput } from '@/lib/calculator/pricing-engine';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/components/ui/accordion';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Loader2, FileText, Mail } from 'lucide-react';
import { toast } from 'sonner';
import materialsRaw from '@/data/materials.json';

const materials = materialsRaw as Record<string, any>;

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PriceResult | null>(null);
  const [inputData, setInputData] = useState<CalculatorInput | null>(null);
  const [loading, setLoading] = useState(true);

  // PDF email states
  const [email, setEmail] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  useEffect(() => {
    const zip = searchParams.get('zip');
    const material = searchParams.get('material');
    const areaSqft = searchParams.get('areaSqft');
    const mid = searchParams.get('mid');
    const low = searchParams.get('low');
    const high = searchParams.get('high');
    const materialCost = searchParams.get('materialCost');
    const laborCost = searchParams.get('laborCost');
    const tearoffCost = searchParams.get('tearoffCost');
    const disposalCost = searchParams.get('disposalCost');
    const permitCost = searchParams.get('permitCost');
    const geoIndex = searchParams.get('geoIndex');
    const isDefaultGeo = searchParams.get('isDefaultGeo');
    const materialName = searchParams.get('materialName');

    if (!zip || !material || !mid || !low || !high) {
      router.push('/calculator');
      return;
    }

    const priceResult: PriceResult = {
      low: parseFloat(low),
      mid: parseFloat(mid),
      high: parseFloat(high),
      breakdown: {
        materialCost: parseFloat(materialCost || '0'),
        laborCost: parseFloat(laborCost || '0'),
        tearoffCost: parseFloat(tearoffCost || '0'),
        disposalCost: parseFloat(disposalCost || '0'),
        permitCost: parseFloat(permitCost || '0'),
      },
      geoIndex: parseFloat(geoIndex || '1'),
      isDefaultGeo: isDefaultGeo === 'true',
      materialName: materialName || materials[material]?.display_name || material,
    };

    setResult(priceResult);
    setInputData({
      zipCode: zip,
      materialType: material,
      areaSqft: parseInt(areaSqft || '2000'),
      pitchFactor: 1.1,
      complexity: 'simple',
      includeTearoff: true,
    });
    setLoading(false);
  }, [searchParams, router]);

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your estimate...</p>
        </div>
      </div>
    );
  }

  if (!result || !inputData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Your Roof Cost Estimate
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Based on your ZIP code and roof details, here is your personalized estimate.
        </p>
      </div>

      <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto">
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
            zipCode={inputData.zipCode}
            materialType={inputData.materialType}
            mid={result.mid}
            low={result.low}
            high={result.high}
          />

          <Card className="w-full max-w-2xl mx-auto shadow-md border-primary/5 mt-12">
            <CardContent className="p-0">
              <Accordion type="single" collapsible defaultValue="quote" className="w-full">
                <AccordionItem value="quote" className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/10">
                    <span className="font-bold text-lg text-primary">
                      Share your actual contractor quote
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <QuoteSubmitForm initialData={inputData} standalone={false} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-8 pt-8 border-t">
            <Button
              variant="outline"
              onClick={() => router.push('/calculator')}
              className="w-full sm:w-auto"
            >
              Calculate Another Estimate
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
