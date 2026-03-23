import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

import { getThemePage } from '@/core/theme';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { generateWebAppSchema } from '@/lib/calculator/schema-markup';

export const revalidate = 3600;

function CalculatorCTA({ locale }: { locale: string }) {
  const cities = [
    { name: "New York City", url: "new-york/new-york-city" },
    { name: "Los Angeles", url: "california/los-angeles" },
    { name: "Houston", url: "texas/houston" },
    { name: "Chicago", url: "illinois/chicago" },
    { name: "Phoenix", url: "arizona/phoenix" },
    { name: "Philadelphia", url: "pennsylvania/philadelphia" },
    { name: "Seattle", url: "washington/seattle" },
    { name: "Denver", url: "colorado/denver" }
  ];

  return (
    <section className="py-20 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-foreground">How much will your new roof cost?</h2>
        <p className="text-xl text-muted-foreground mb-8">Get an instant, localized estimate — no signup, no sales calls.</p>
        <Link href={`/${locale}/calculator`} className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
          Try the Free Calculator &rarr;
        </Link>
        <div className="mt-8 text-sm md:text-base text-muted-foreground flex flex-wrap justify-center items-center gap-2">
          <span className="font-semibold text-foreground">Popular:</span>
          {cities.map((city, idx) => (
            <span key={city.name} className="flex items-center">
              <Link href={`/${locale}/roof-cost/${city.url}`} className="hover:text-primary transition-colors underline underline-offset-4 decoration-primary/30">
                {city.name}
              </Link>
              {idx < cities.length - 1 && <span className="mx-2 text-border">&bull;</span>}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.index');

  // get page data
  const originalPage: DynamicPage = t.raw('page');
  const page: DynamicPage = JSON.parse(JSON.stringify(originalPage)); // deep clone

  if (page.sections) {
    const newSections: Record<string, any> = {};
    for (const [key, val] of Object.entries(page.sections)) {
      newSections[key] = val;
      if (key === 'hero') {
        newSections['calculator-cta'] = {
          disabled: false,
          component: <CalculatorCTA locale={locale} />
        };
      }
    }
    page.sections = newSections;
  }

  // load page component
  const Page = await getThemePage('dynamic-page');
  const schemaMarkup = generateWebAppSchema();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <Page locale={locale} page={page} />
    </>
  );
}
