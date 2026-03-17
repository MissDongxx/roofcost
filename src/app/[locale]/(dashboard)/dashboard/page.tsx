import { redirect } from '@/core/i18n/navigation';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Redirect to inspections page (roof inspection list and create new)
  redirect({ href: '/inspections', locale });
}
