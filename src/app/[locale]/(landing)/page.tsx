import { setRequestLocale } from 'next-intl/server';
import dynamic from 'next/dynamic';

import { getThemeBlock } from '@/core/theme';
import { generateWebAppSchema } from '@/lib/calculator/schema-markup';

export const revalidate = 3600;

// Lazy load the homepage component for better initial load performance
// Lazy load the homepage component with a better skeleton to reduce CLS
const RoofcostHomepage = dynamic<{
  section?: any;
  isCustomHomepage?: boolean;
  locale?: string;
}>(() => getThemeBlock('roofcost-homepage').then(mod => mod.default || mod), {
  loading: () => (
    <div className="w-full min-h-[calc(100vh-var(--nav-height))] flex items-center justify-center bg-[var(--cream)]">
      <div className="max-w-[1200px] w-full mx-auto px-4 md:px-12 grid md:grid-cols-[1fr_480px] gap-0 items-center">
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-4 w-48 bg-gray-200/60 rounded"></div>
          <div className="h-20 w-full max-w-md bg-gray-200/60 rounded"></div>
          <div className="h-12 w-full max-w-xs bg-gray-200/60 rounded"></div>
        </div>
        <div className="hidden md:block h-[500px] bg-gray-200/60 rounded-xl animate-pulse"></div>
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
      <RoofcostHomepage section={{}} isCustomHomepage={true} locale={locale} />
    </>
  );
}
