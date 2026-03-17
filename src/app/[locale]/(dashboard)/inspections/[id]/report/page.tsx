import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { getAuth } from '@/core/auth';
import { findInspectionById } from '@/shared/models/inspection';
import { findReportByInspectionId } from '@/shared/models/report';
import { getRemainingCredits } from '@/shared/models/credit';
import ReportClient from './ReportClient';

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id: inspectionId } = await params;
  const t = await getTranslations('inspections.report');
  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Get inspection
  const inspection = await findInspectionById(inspectionId);
  if (!inspection || inspection.userId !== session.user.id) {
    redirect('/inspections');
  }

  // Get report if exists
  const report = await findReportByInspectionId(inspectionId);

  // Get user credits
  const credits = await getRemainingCredits(session.user.id);

  return (
    <ReportClient
      inspection={inspection}
      report={report}
      userCredits={credits}
      translations={t}
    />
  );
}
