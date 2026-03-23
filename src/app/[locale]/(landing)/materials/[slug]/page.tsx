import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import materialsData from '@/data/materials.json';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';

export const revalidate = 86400; // 24 hours

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export function generateStaticParams() {
  return Object.keys(materialsData).map((slug) => ({
    slug: slug.replace(/_/g, '-'),
  }));
}

export default async function MaterialDetailPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const materialKey = slug.replace(/-/g, '_');
  const material = (materialsData as Record<string, any>)[materialKey];

  if (!material) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 min-h-screen bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href={`/${locale}/materials`} className="text-[var(--rust)] hover:underline flex items-center gap-2 mb-4">
            ← Back to Materials
          </Link>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-[var(--ink)]">
            {material.display_name} Replacement Cost
          </h1>
          <p className="text-[var(--ink-3)] text-xl leading-relaxed">
            Everything you need to know about {material.display_name.toLowerCase()} roofing: 
            prices, lifespan, and a localized cost calculator for your home.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-[var(--cream-3)] shadow-sm bg-white">
            <CardHeader className="pb-2">
              <span className="text-xs font-mono uppercase text-[var(--ink-3)]">Avg. Price / Sq Ft</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--rust)]">
                ${material.price_mid_sqft.toFixed(2)}
              </div>
              <p className="text-xs text-[var(--ink-3)] mt-1">Installed</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cream-3)] shadow-sm bg-white">
            <CardHeader className="pb-2">
              <span className="text-xs font-mono uppercase text-[var(--ink-3)]">Price Range</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--slate)]">
                ${material.price_low_sqft.toFixed(2)} - ${material.price_high_sqft.toFixed(2)}
              </div>
              <p className="text-xs text-[var(--ink-3)] mt-1">Depending on complexity</p>
            </CardContent>
          </Card>
          <Card className="border-[var(--cream-3)] shadow-sm bg-white">
            <CardHeader className="pb-2">
              <span className="text-xs font-mono uppercase text-[var(--ink-3)]">Expected Lifespan</span>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[var(--slate)]">
                {material.lifespan_years} Years
              </div>
              <p className="text-xs text-[var(--ink-3)] mt-1">With proper maintenance</p>
            </CardContent>
          </Card>
        </div>

        <section className="bg-white rounded-2xl p-8 border border-[var(--cream-3)] shadow-lg mb-12">
          <h2 className="font-serif text-2xl font-bold mb-6 text-center text-[var(--slate)]">
            Calculate {material.display_name} Cost for Your Area
          </h2>
          <div className="max-w-2xl mx-auto">
             <CalculatorForm defaultMaterial={materialKey} />
          </div>
        </section>

        <div className="prose prose-slate max-w-none">
          <h2 className="font-serif text-2xl font-bold text-[var(--slate)] mb-4">About {material.display_name}</h2>
          <p className="text-[var(--ink-2)] text-lg leading-relaxed mb-6">
            {material.description || `Explore the benefits and costs of ${material.display_name.toLowerCase()} for your next roofing project. 
            This material offers a unique combination of durability and style that has made it a popular choice for homeowners.`}
          </p>
          <p className="text-[var(--ink-2)] text-lg leading-relaxed">
            When choosing {material.display_name.toLowerCase()}, it's important to consider both the upfront investment and the 
            long-term value. Our calculator above uses real-time local labor rates to give you the most accurate estimate possible.
          </p>
        </div>
      </div>
    </div>
  );
}
