import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/core/i18n/config';
import { ThemeProvider } from '@/core/theme/provider';
import { Toaster } from '@/shared/components/ui/sonner';
import { AppContextProvider } from '@/shared/contexts/app';
import { getMetadata } from '@/shared/lib/seo';

import { envConfigs } from '@/config';

export const generateMetadata = async () => {
  return {
    title: 'RoofCostAI — Free Roof Replacement Cost Calculator',
    description: 'Get an instant, math-based roof replacement cost estimate for your home. No signup, no sales calls, just your number.',
    icons: {
      icon: envConfigs.app_favicon,
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
