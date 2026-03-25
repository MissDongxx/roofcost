import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/core/i18n/config';
import { ThemeProvider } from '@/core/theme/provider';
import { Toaster } from '@/shared/components/ui/sonner';
import { AppContextProvider } from '@/shared/contexts/app';

import { envConfigs } from '@/config';

export const generateMetadata = async () => {
  return {
    metadataBase: new URL(envConfigs.app_url || 'https://roofcostai.com'),
    title: {
      default: 'RoofCostAI — Free Roof Replacement Cost Calculator',
      template: '%s | RoofCostAI',
    },
    description: 'Get an instant, math-based roof cost estimate for your home. RoofCostAI provides transparent pricing with no signup or sales calls. Start your roofing project today.',
    icons: {
      icon: envConfigs.app_favicon,
    },
    alternates: {
      canonical: '/',
      languages: Object.fromEntries(
        routing.locales.map((loc) => [
          loc,
          loc === 'en' ? '/' : `/${loc}`,
        ])
      ),
    },
    openGraph: {
      title: 'RoofCostAI — Free Roof Replacement Cost Calculator',
      description: 'Get an instant, math-based roof cost estimate for your home. RoofCostAI provides transparent pricing with no signup or sales calls.',
      url: './',
      siteName: 'RoofCostAI',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: envConfigs.app_preview_image || '/preview.png',
          width: 1200,
          height: 630,
          alt: 'RoofCostAI Preview',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'RoofCostAI — Free Roof Replacement Cost Calculator',
      description: 'Get an instant, math-based roof cost estimate for your home. No signup, no sales calls.',
      images: [envConfigs.app_preview_image || '/preview.png'],
    },
    other: {
      'dns-prefetch': 'https://www.googletagmanager.com',
      'preconnect': 'https://www.google-analytics.com',
    },
  };
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <ThemeProvider>
        <AppContextProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AppContextProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
