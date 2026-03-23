import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import citiesData from '@/data/cities.json';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

export const revalidate = 86400; // 24 hours

export default async function StateIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Group cities by state
  const states = citiesData.reduce((acc, city) => {
    if (!acc[city.state]) {
      acc[city.state] = {
        name: city.state,
        stateCode: city.stateCode,
        cities: [],
      };
    }
    acc[city.state].cities.push(city);
    return acc;
  }, {} as Record<string, { name: string; stateCode: string; cities: typeof citiesData }>);

  const sortedStates = Object.values(states).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container mx-auto px-4 pt-12 pb-16 min-h-screen bg-[var(--cream)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-4xl font-bold mb-4 text-[var(--ink)]">Roofing Costs by State</h1>
        <p className="text-[var(--ink-3)] text-lg mb-12">
          Select a state below to view detailed roofing replacement cost estimates for major cities and regions. 
          Our data is updated for 2026 based on local labor market indexes.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {sortedStates.map((state) => (
            <Card key={state.name} className="border-[var(--cream-3)] shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader className="bg-[var(--slate-light)]/30">
                <CardTitle className="font-serif text-2xl text-[var(--slate)] capitalize">
                  {state.name} ({state.stateCode})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-[var(--ink-3)] mb-4">
                  Showing {state.cities.length} major {state.cities.length === 1 ? 'city' : 'cities'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {state.cities.map((city) => (
                    <Link
                      key={city.slug}
                      href={`/${locale}/roof-cost/${city.state}/${city.slug}`}
                      className="text-sm bg-[var(--cream)] text-[var(--slate)] px-3 py-1.5 rounded-full hover:bg-[var(--rust)] hover:text-white transition-colors"
                    >
                      {city.displayName}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
