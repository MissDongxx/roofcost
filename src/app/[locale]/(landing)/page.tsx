import { setRequestLocale } from 'next-intl/server';

import { generateWebAppSchema } from '@/lib/calculator/schema-markup';
import { RoofcostHomepage } from '@/themes/default/blocks/roofcost-homepage';

export const revalidate = 3600;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Generate schema markup once during server-side rendering
  const schemaMarkup = generateWebAppSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        suppressHydrationWarning
      />
      <RoofcostHomepage section={{}} isCustomHomepage={true} locale={locale} />
    </>
  );
}
