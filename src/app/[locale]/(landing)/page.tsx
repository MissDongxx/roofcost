import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';

import { getThemeBlock } from '@/core/theme';
import { generateWebAppSchema } from '@/lib/calculator/schema-markup';

export const revalidate = 3600;

// Lazy load the homepage component for better initial load performance
const RoofcostHomepage = dynamic(() => getThemeBlock('roofcost-homepage').then(mod => mod.default || mod), {
  loading: () => (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
  ssr: true,
});

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
      <RoofcostHomepage section={{}} isCustomHomepage={true} />
    </>
  );
}
