import { getTranslations } from 'next-intl/server';
import { getThemePage } from '@/core/theme';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('pages.dashboard');

  // For MVP skeleton, we just use a basic layout.
  // In a real implementation, this would fetch inspections from the DB.
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
      <div className="bg-secondary p-10 rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">{t('no_inspections')}</p>
        <a 
          href={`/${locale}/inspections/new`}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          {t('start_new')}
        </a>
      </div>
    </div>
  );
}
