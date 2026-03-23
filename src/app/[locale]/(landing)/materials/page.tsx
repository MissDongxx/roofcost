import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import materialsData from '@/data/materials.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export const revalidate = 86400; // 24 hours

export default async function MaterialsOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const materials = Object.entries(materialsData).map(([slug, data]) => ({
    slug,
    ...data,
  }));

  return (
    <div className="container mx-auto px-4 pt-32 pb-16 min-h-screen bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-4 text-[var(--ink)]">Roofing Materials Guide</h1>
        <p className="text-[var(--ink-3)] text-lg mb-12">
          Compare different roofing materials to find the best balance of cost, longevity, and aesthetics for your home. 
          Click any material to see a detailed price breakdown and use our localized cost calculator.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <Link key={material.slug} href={`/${locale}/materials/${material.slug.replace(/_/g, '-')}`} className="block h-full group">
              <Card className="h-full border-[var(--cream-3)] shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-white overflow-hidden">
                <CardHeader className="bg-[var(--slate-light)]/20 pb-4">
                  <CardTitle className="font-serif text-xl text-[var(--slate)] group-hover:text-[var(--rust)] transition-colors">
                    {material.display_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-2xl font-bold text-[var(--rust)]">
                      ${material.price_low_sqft.toFixed(2)} - ${material.price_high_sqft.toFixed(2)}
                    </span>
                    <span className="text-xs text-[var(--ink-3)] font-mono uppercase">per sq ft</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--ink-3)] font-medium">Lifespan:</span>
                      <span className="text-[var(--ink)]">{material.lifespan_years} Years</span>
                    </div>
                    {material.description && (
                      <p className="text-sm text-[var(--ink-3)] line-clamp-2 italic">
                        "{material.description}"
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex items-center text-[var(--rust)] font-semibold text-sm">
                    View Prices & Calculator →
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
