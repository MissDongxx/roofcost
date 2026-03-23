import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import geoDataRaw from '@/data/geo-cost-index.json';
import { CityCalculatorWrapper } from '@/components/calculator/CityCalculatorWrapper';
import { getLocalRoofingSchema } from '@/lib/calculator/schema-markup';

const GEO_DATA: Record<string, any> = geoDataRaw;
export async function generateMetadata({ params }: { params: { state: string, city: string } }): Promise<Metadata> {
  const state = params.state.toUpperCase();
  const city = decodeURIComponent(params.city).replace(/-/g, ' ');
  // Capitalize city
  const cityName = city.replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `Roof Replacement Cost in ${cityName}, ${state} | Local Price Guide`,
    description: `Get accurate, localized roof replacement cost estimates for ${cityName}, ${state}. Learn about labor rates, material prices, and what to expect for your new roof.`,
  };
}

// Optional: generate static params for top 200 cities
export async function generateStaticParams() {
  // To keep build fast, we just return a few examples, others will be server rendered
  return [
    { state: 'ny', city: 'new-york-city' },
    { state: 'ca', city: 'los-angeles' },
    { state: 'tx', city: 'houston' },
  ];
}

export default function CityRoofCostPage({ params }: { params: { state: string, city: string } }) {
  const state = params.state.toUpperCase();
  const city = decodeURIComponent(params.city).replace(/-/g, ' ');
  const cityName = city.replace(/\b\w/g, c => c.toUpperCase());

  // Find a matching ZIP code in geo data for this city if possible, or fallback
  let defaultZip = '';
  for (const [zip, data] of Object.entries(GEO_DATA)) {
    if (data.state_code === state) {
      if (data.metro_area && data.metro_area.toLowerCase().includes(city.toLowerCase())) {
        defaultZip = zip;
        break;
      }
    }
  }

  // If we didn't find an exact city match, just find the first zip for the state
  if (!defaultZip) {
    for (const [zip, data] of Object.entries(GEO_DATA)) {
      if (data.state_code === state) {
        defaultZip = zip;
        break;
      }
    }
  }

  const geoInfo = defaultZip ? GEO_DATA[defaultZip] : GEO_DATA['__default__'];
  
  // Calculate average local base rate
  // National average is roughly $4.50 sq ft for architectural + $2.75 labor = $7.25 mid.
  // With tearoff ($1.20) it's ~ $8.50 / sqft
  const localSqftRate = 8.50 * ((geoInfo.labor_cost_index + geoInfo.material_index) / 2);

  const schemaData = getLocalRoofingSchema(cityName, state, localSqftRate * 2000);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Roof Replacement Cost in {cityName}, {state}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Planning a roof replacement in {cityName}? Your local labor rates are approximately {Math.round((geoInfo.labor_cost_index - 1) * 100)}% {geoInfo.labor_cost_index >= 1 ? 'higher' : 'lower'} than the national average. Use our calculator below for a precise estimate.
        </p>
      </div>
      
      <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto">
        <section className="bg-primary/5 p-6 rounded-2xl border border-primary/20 text-center">
          <h2 className="text-2xl font-bold mb-2">Average Cost in {cityName}</h2>
          <p className="text-xl mb-4">Expect to pay around <strong className="text-primary">${localSqftRate.toFixed(2)}</strong> per square foot for a standard architectural shingle roof, including materials and labor.</p>
        </section>

        {/* Dynamic Client Form below */}
        <section>
          {/* Note: the component is already a Client Component and we can't pass functions directly into it from Server Component easily if it's imported in another Client component. But here we just use it directly. We'd need to adapt CalculatorForm to accept defaultZip or we wrap it in a client layout. */}
          {/* For MVP, we'll embed an iframe or make a wrapper. Actually, we can just render CalculatorPage as a Client Component, or extract a smart wrapper. */}
          {/* We'll use a local Client Wrapper to handle the calculations so SEO page stays Server Component */}
          <CityCalculatorWrapper defaultZip={defaultZip} />
        </section>

        <section className="prose prose-lg max-w-none mt-12 dark:prose-invert">
          <h2>Why get local roofing estimates in {cityName}?</h2>
          <p>Roofing costs vary wildly based on weather conditions, local building codes, and prevailing wage rates in {state}. By using our hyper-localized calculator, you get an estimate that reflects true market conditions in your exact area, saving you from surprises when the contractor hands you the final bill.</p>
        </section>
      </div>
    </div>
  );
}
