import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/core/i18n/config';
import citiesData from '@/data/cities.json';
import materialsRaw from '@/data/materials.json';
import { calculateRoofCost } from '@/lib/calculator/pricing-engine';
import { CityCalculator } from './CityCalculator';
import { generateFAQSchema, generateBreadcrumbSchema } from '@/lib/calculator/schema-markup';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours

interface PageProps {
  params: Promise<{ locale: string; state: string; city: string }>;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => 
    citiesData.map((c) => ({
      locale,
      state: c.state,
      city: c.slug,
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { state, city } = await params;
  // Case-insensitive lookup
  const cityData = citiesData.find(
    (c) => c.state.toLowerCase() === state.toLowerCase() && c.slug.toLowerCase() === city.toLowerCase()
  );
  
  if (!cityData) {
    return { title: 'Not Found' };
  }

  // Calculate mid estimate for Architectural Shingles (2000 sqft)
  const estimate = await calculateRoofCost({
    zipCode: cityData.zip,
    areaSqft: 2000,
    materialType: 'asphalt_architectural',
    pitchFactor: 1.1,
    complexity: 'simple',
    includeTearoff: true
  });

  const lowPrice = new Intl.NumberFormat('en-US', { currency: 'USD', maximumFractionDigits: 0 }).format(estimate.low);
  const highPrice = new Intl.NumberFormat('en-US', { currency: 'USD', maximumFractionDigits: 0 }).format(estimate.high);

  const canonicalUrl = `/roof-cost/${state.toLowerCase()}/${city.toLowerCase()}`;

  return {
    title: `Roof Replacement Cost in ${cityData.displayName}, ${cityData.stateCode} (2026)`,
    description: `The average cost for a roof replacement in ${cityData.displayName} is currently ${lowPrice}–${highPrice}. Get your free, instant calculator estimate today—no signup or sales calls required.`,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CityLandingPage({ params }: PageProps) {
  const { state, city, locale } = await params;
  setRequestLocale(locale);

  // Case-insensitive lookup
  const cityData = citiesData.find(
    (c) => c.state.toLowerCase() === state.toLowerCase() && c.slug.toLowerCase() === city.toLowerCase()
  );
  
  if (!cityData) {
    notFound();
  }

  // Calculate estimates to show on page
  const estimate = await calculateRoofCost({
    zipCode: cityData.zip,
    areaSqft: 2000,
    materialType: 'asphalt_architectural',
    pitchFactor: 1.1,
    complexity: 'simple',
    includeTearoff: true
  });

  const percentDiff = Math.abs(Math.round((cityData.laborIndex - 1.0) * 100));
  const diffWord = cityData.laborIndex >= 1.0 ? 'above' : 'below';
  const effectWord = cityData.laborIndex >= 1.0 ? 'raises' : 'lowers';

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Generate Materials Table Data
  const materials = materialsRaw as Record<string, any>;
  const activeMaterials = ['asphalt_3tab', 'asphalt_architectural', 'metal_standing_seam', 'metal_corrugated', 'tile_concrete', 'slate'];
  
  const materialTableData = await Promise.all(activeMaterials.map(async (matKey) => {
    const matEstimate = await calculateRoofCost({
      zipCode: cityData.zip,
      areaSqft: 2000,
      materialType: matKey,
      pitchFactor: 1.1,
      complexity: 'simple',
      includeTearoff: true
    });
    return {
      name: materials[matKey].display_name,
      priceRange: `${formatCurrency(matEstimate.low)} - ${formatCurrency(matEstimate.high)}`,
      lifespan: `${materials[matKey].lifespan_years} Years`,
      features: materials[matKey].description || 'Durable standard option'
    };
  }));

  const faqs = [
    { q: `How much does a roof replacement cost in ${cityData.displayName}?`, a: `The average cost for a 2,000 sq.ft roof replacement in ${cityData.displayName} ranges from ${formatCurrency(estimate.low)} to ${formatCurrency(estimate.high)} depending on the materials used and roof complexity.` },
    { q: `What factors affect roofing costs in ${cityData.displayName}?`, a: `Key factors include roof size, material choice, pitch (steepness), complexity (number of valleys and dormers), and local labor rates which are currently ${percentDiff}% ${diffWord} the national average.` },
    { q: `What is the cheapest roofing material in ${cityData.displayName}?`, a: `Asphalt 3-Tab shingles are generally the most affordable option, offering a good balance of cost and durability.` },
    { q: `How long does a roof replacement take in ${cityData.displayName}?`, a: `Most residential roof replacements take 1 to 3 days, depending on the weather, roof size, and the condition of the underlying structure.` },
    { q: `Does ${cityData.displayName}'s climate affect roofing costs?`, a: `Yes, local climate determines the best materials and necessary underlayments for your roof to withstand regional weather conditions, which can impact the overall cost.` },
  ];

  const faqSchema = generateFAQSchema(faqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${locale}` },
    { name: cityData.state.charAt(0).toUpperCase() + cityData.state.slice(1), url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${locale}/roof-cost/${cityData.state}` },
    { name: cityData.displayName, url: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${locale}/roof-cost/${cityData.state}/${cityData.slug}` }
  ]);

  const sameStateCities = citiesData.filter(c => c.state === cityData.state && c.slug !== cityData.slug).slice(0, 10);
  const otherStateCities = citiesData.filter(c => c.state !== cityData.state).slice(0, 5);

  return (
    <div className="container mx-auto px-4 pt-12 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <h1 className="text-4xl font-bold mb-6 text-center">Roof Replacement Cost in {cityData.displayName}, {cityData.stateCode} (2026)</h1>
      
      <Card className="mb-8 max-w-2xl mx-auto border-primary">
        <CardHeader className="bg-primary/5 pb-4">
          <CardTitle className="text-xl">Cost Estimate for 2,000 sq.ft Architectural Shingles</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center text-center">
            <div>
              <p className="text-muted-foreground text-sm">Low Estimate</p>
              <p className="text-2xl font-semibold">{formatCurrency(estimate.low)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm text-primary font-bold">Mid Estimate</p>
              <p className="text-4xl font-bold text-primary">{formatCurrency(estimate.mid)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">High Estimate</p>
              <p className="text-2xl font-semibold">{formatCurrency(estimate.high)}</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">Based on national average data (adjusted for local labor rates)</p>
        </CardContent>
      </Card>

      <div className="prose max-w-4xl mx-auto mb-10">
        <p className="text-lg leading-relaxed text-center text-muted-foreground">
          {cityData.displayName}'s labor costs are <strong>{percentDiff}% {diffWord}</strong> the national average, which <strong>{effectWord}</strong> your total roofing cost. The exact price you pay will depend on your roof's pitch, complexity, and the contractor you choose. 
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-4">Material Price Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-primary/20 bg-muted/20">
                <th className="p-3">Material</th>
                <th className="p-3">Est. Price Range</th>
                <th className="p-3">Lifespan</th>
                <th className="p-3">Features</th>
              </tr>
            </thead>
            <tbody>
              {materialTableData.map((row, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/10">
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3 text-primary font-semibold">{row.priceRange}</td>
                  <td className="p-3">{row.lifespan}</td>
                  <td className="p-3 text-sm text-muted-foreground">{row.features}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
              <p className="text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-16 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6 text-center">Get Your Personalized Estimate</h2>
        <CityCalculator defaultZip={cityData.zip} />
      </div>

      <div className="max-w-4xl mx-auto border-t pt-16">
        <h2 className="text-2xl font-bold mb-8 text-center tracking-tight">Explore More Roofing Costs</h2>
        
        <div className="mb-12">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <span className="w-1.5 h-5 bg-primary rounded-full mr-3"></span>
            Other cities in {cityData.stateCode}
          </h3>
          {sameStateCities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sameStateCities.map(c => (
                <Link key={c.slug} href={`/${locale}/roof-cost/${c.state.toLowerCase()}/${c.slug}`} className="group block p-4 bg-card border border-border rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all text-center">
                  <span className="font-medium group-hover:text-primary transition-colors">{c.displayName}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground p-6 bg-muted/20 border border-border rounded-xl text-center">No other major cities listed.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <span className="w-1.5 h-5 bg-primary rounded-full mr-3"></span>
            Explore by state
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {otherStateCities.map(c => (
              <Link key={c.slug} href={`/${locale}/roof-cost/${c.state.toLowerCase()}/${c.slug}`} className="group block p-4 bg-card border border-border rounded-xl hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all text-center">
                <span className="font-medium group-hover:text-primary transition-colors capitalize">{c.state}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
