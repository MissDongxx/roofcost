import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findInspectionById } from '@/shared/models/inspection';
import { getInspectionPhotos } from '@/shared/models/photo';
import { getInspectionObservations } from '@/shared/models/observation';
import { getConfirmedScopeItems } from '@/shared/models/scope_item';
import { findReportByInspectionId, createReport } from '@/shared/models/report';
import { getStorageService } from '@/shared/services/storage';
import { gatherReportData, generatePDFBuffer, generateReportFilename } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inspectionId } = body;

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id' },
        { status: 400 }
      );
    }

    // Check if user owns this inspection
    const inspection = await findInspectionById(inspectionId);
    if (!inspection || inspection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Check if report already exists
    const existingReport = await findReportByInspectionId(inspectionId);
    if (existingReport) {
      return NextResponse.json({
        id: existingReport.id,
        message: 'Report already exists',
      });
    }

    // Gather all data
    const photos = await getInspectionPhotos(inspectionId);
    const observations = await getInspectionObservations(inspectionId);
    const scopeItems = await getConfirmedScopeItems(inspectionId);

    if (scopeItems.length === 0) {
      return NextResponse.json(
        { error: 'No confirmed scope items. Please review and confirm items before generating report.' },
        { status: 400 }
      );
    }

    // Generate report data
    const reportData = await gatherReportData(inspection, photos, observations, scopeItems);

    // Generate PDF buffer
    const pdfBuffer = await generatePDFBuffer(reportData);

    // Upload to storage
    const storage = await getStorageService();
    const filename = generateReportFilename(inspection);
    const uploadPath = `reports/${session.user.id}/${inspection.id}/${filename}`;

    const uploadResult = await storage.uploadFile({
      key: uploadPath,
      body: pdfBuffer,
      contentType: 'application/pdf',
    });

    if (!uploadResult.url) {
      throw new Error('Failed to upload PDF to storage');
    }

    // Create report record
    const report = await createReport({
      inspectionId,
      storageUrl: uploadResult.url,
      shareExpiresAt: null, // No expiration by default
    });

    return NextResponse.json({
      id: report.id,
      downloadUrl: uploadResult.url,
      shareToken: report.shareToken,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
