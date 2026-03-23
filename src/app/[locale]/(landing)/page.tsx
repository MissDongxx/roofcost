import { setRequestLocale } from 'next-intl/server';

import { getThemeBlock } from '@/core/theme';
import { generateWebAppSchema } from '@/lib/calculator/schema-markup';

export const revalidate = 3600;

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Load the custom homepage component
  const RoofcostHomepage = await getThemeBlock('roofcost-homepage');
  const schemaMarkup = generateWebAppSchema();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <RoofcostHomepage section={{}} isCustomHomepage={true} />
    </>
  );
}
