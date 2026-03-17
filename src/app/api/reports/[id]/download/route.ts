import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findReportById } from '@/shared/models/report';
import { findInspectionById } from '@/shared/models/inspection';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reportId = params.id;

    // Find report
    const report = await findReportById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user owns the inspection
    const inspection = await findInspectionById(report.inspectionId);
    if (!inspection || inspection.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Return the storage URL directly
    // Note: For signed URLs with expiration, you would need to implement
    // a signed URL generation function in your storage provider
    return NextResponse.redirect(report.storageUrl);
  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { error: 'Failed to download report' },
      { status: 500 }
    );
  }
}
