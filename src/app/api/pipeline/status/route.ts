import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findInspectionById } from '@/shared/models/inspection';
import { getInspectionPhotos } from '@/shared/models/photo';
import { getInspectionObservations } from '@/shared/models/observation';
import { getInspectionScopeItems } from '@/shared/models/scope_item';

/**
 * Pipeline Status API
 * 用于前端轮询获取 AI pipeline 的实时状态
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inspectionId = searchParams.get('inspection_id');

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id parameter' },
        { status: 400 }
      );
    }

    // Get inspection
    const inspection = await findInspectionById(inspectionId);
    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Get related data
    const photos = await getInspectionPhotos(inspectionId);
    const observations = await getInspectionObservations(inspectionId);
    const scopeItems = await getInspectionScopeItems(inspectionId);

    // Calculate progress
    const totalSteps = 5;
    const completedSteps = [
      inspection.status !== 'draft', // photos uploaded
      observations.length > 0, // vision completed
      observations.some(o => o.component), // classification completed
      scopeItems.length > 0, // rule engine completed
      scopeItems.some(s => s.description), // scope description completed
    ].filter(Boolean).length;

    const currentStep =
      inspection.status === 'draft'
        ? 0
        : inspection.status === 'processing'
          ? 1
          : inspection.status === 'review'
            ? totalSteps
            : totalSteps;

    // Determine if any errors occurred
    const photosWithErrors = photos.filter(p => !p.processedUrl).length;
    const observationsWithoutClassification = observations.filter(
      o => !o.component
    ).length;

    return NextResponse.json({
      success: true,
      inspection: {
        id: inspection.id,
        status: inspection.status,
        address: inspection.address,
        roofType: inspection.roofType,
      },
      progress: {
        currentStep,
        totalSteps,
        percentage: Math.round((completedSteps / totalSteps) * 100),
        completedSteps,
        isComplete: inspection.status === 'review' || inspection.status === 'complete',
      },
      photos: {
        total: photos.length,
        uploaded: photos.filter(p => p.storageUrl).length,
        processed: photos.filter(p => p.processedUrl).length,
        annotated: photos.filter(p => p.annotatedUrl).length,
        withErrors: photosWithErrors,
      },
      observations: {
        total: observations.length,
        classified: observations.filter(o => o.component).length,
        withoutClassification: observationsWithoutClassification,
      },
      scopeItems: {
        total: scopeItems.length,
        confirmed: scopeItems.filter(item => item.confirmed).length,
        pending: scopeItems.filter(item => !item.confirmed && !item.deleted).length,
        deleted: scopeItems.filter(item => item.deleted).length,
      },
      // Detailed step status
      steps: [
        {
          name: 'Photos Upload',
          status: photos.length > 0 ? 'completed' : 'pending',
          detail: `${photos.filter(p => p.storageUrl).length}/${photos.length} uploaded`,
        },
        {
          name: 'Vision Analysis',
          status: observations.length > 0 ? 'completed' : inspection.status === 'processing' ? 'running' : 'pending',
          detail: `${observations.length} observations generated`,
        },
        {
          name: 'Classification',
          status: observations.some(o => o.component) ? 'completed' : inspection.status === 'processing' ? 'running' : 'pending',
          detail: `${observations.filter(o => o.component).length}/${observations.length} classified`,
        },
        {
          name: 'Rule Engine',
          status: scopeItems.length > 0 ? 'completed' : inspection.status === 'processing' ? 'running' : 'pending',
          detail: `${scopeItems.length} scope items generated`,
        },
        {
          name: 'Scope Description',
          status: scopeItems.some(s => s.description) ? 'completed' : inspection.status === 'processing' ? 'running' : 'pending',
          detail: `${scopeItems.filter(s => s.description).length}/${scopeItems.length} described`,
        },
      ],
    });
  } catch (error) {
    console.error('[Pipeline Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get pipeline status' },
      { status: 500 }
    );
  }
}
