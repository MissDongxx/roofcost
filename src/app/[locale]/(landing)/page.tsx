import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { generateWebAppSchema } from '@/lib/calculator/schema-markup';
import { HomepageCalculatorEntry } from '@/components/calculator/HomepageCalculatorEntry';

export const revalidate = 3600;

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
          component: <HomepageCalculatorEntry locale={locale} />
        };
      }
    }
    page.sections = newSections;

    // Add calculator-cta to show_sections
    if (page.show_sections) {
      const heroIndex = page.show_sections.indexOf('hero');
      if (heroIndex !== -1) {
        page.show_sections.splice(heroIndex + 1, 0, 'calculator-cta');
      }
    }
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
