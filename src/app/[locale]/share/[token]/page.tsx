import { notFound } from 'next/navigation';
import { Metadata } from 'next';

import { findReportByShareToken, isShareTokenValid } from '@/shared/models/report';
import { findInspectionById } from '@/shared/models/inspection';
import ShareReportClient from './client';

interface SharePageProps {
  params: {
    locale: string;
    token: string;
  };
}

export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  try {
    const report = await findReportByShareToken(params.token);
    if (!report) {
      return { title: 'Report Not Found' };
    }

    const inspection = await findInspectionById(report.inspectionId);
    return {
      title: `Roof Inspection Report - ${inspection?.address || 'Property'}`,
    };
  } catch {
    return { title: 'Roof Inspection Report' };
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = params;

  // Check if share token is valid
  const isValid = await isShareTokenValid(token);

  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Link Expired</h1>
          <p className="text-gray-600">
            This share link has expired or is invalid. Please contact the report owner for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Get report and inspection data
  const report = await findReportByShareToken(token);
  if (!report) {
    notFound();
  }

  const inspection = await findInspectionById(report.inspectionId);
  if (!inspection) {
    notFound();
  }

  return (
    <ShareReportClient
      report={report}
      inspection={inspection}
    />
  );
}
