import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findReportById, regenerateShareToken, isShareTokenValid } from '@/shared/models/report';
import { findInspectionById } from '@/shared/models/inspection';

// GET - Get share info for a report
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

    // Check if share link is still valid
    const isValid = await isShareTokenValid(report.shareToken || '');

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const shareUrl = report.shareToken
      ? `${baseUrl}/share/${report.shareToken}`
      : null;

    return NextResponse.json({
      shareUrl,
      isActive: !!report.shareToken && isValid,
      expiresAt: report.shareExpiresAt,
    });
  } catch (error) {
    console.error('Error getting share info:', error);
    return NextResponse.json(
      { error: 'Failed to get share info' },
      { status: 500 }
    );
  }
}

// POST - Generate or regenerate share link
export async function POST(
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
    const body = await request.json();
    const { expiresInDays } = body;

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

    // Calculate expiration date if specified
    let expiresAt: Date | undefined;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Regenerate share token
    const updatedReport = await regenerateShareToken(reportId, expiresAt);

    // Generate share URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const shareUrl = `${baseUrl}/share/${updatedReport.shareToken}`;

    return NextResponse.json({
      shareUrl,
      token: updatedReport.shareToken,
      expiresAt: updatedReport.shareExpiresAt,
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

// DELETE - Revoke share link
export async function DELETE(
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

    // Revoke by setting shareToken to null and expiration to past
    const { updateReport } = await import('@/shared/models/report');
    await updateReport(reportId, {
      shareToken: null,
      shareExpiresAt: new Date(0), // Set to epoch time (expired)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking share link:', error);
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    );
  }
}
