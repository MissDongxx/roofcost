import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findInspectionById } from '@/shared/models/inspection';
import { getInspectionScopeItems, confirmScopeItem, deleteScopeItem } from '@/shared/models/scope_item';
import { areAllScopeItemsReviewed } from '@/shared/models/scope_item';

/**
 * GET /api/inspections/[id]/review
 * Get scope items for review
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: inspectionId } = await params;

    // Get inspection
    const inspection = await findInspectionById(inspectionId);
    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Get scope items
    const scopeItems = await getInspectionScopeItems(inspectionId);

    // Check review status
    const allReviewed = await areAllScopeItemsReviewed(inspectionId);

    return NextResponse.json({
      success: true,
      inspection: {
        id: inspection.id,
        address: inspection.address,
        roofType: inspection.roofType,
        status: inspection.status,
      },
      scopeItems,
      reviewStatus: {
        total: scopeItems.length,
        confirmed: scopeItems.filter((item) => item.confirmed).length,
        deleted: scopeItems.filter((item) => item.deleted).length,
        pending: scopeItems.filter((item) => !item.confirmed && !item.deleted).length,
        allReviewed,
      },
    });
  } catch (error) {
    console.error('[Review API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get review data' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inspections/[id]/review
 * Confirm or delete a scope item
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: inspectionId } = await params;
    const body = await request.json();
    const { scopeItemId, action, description } = body;

    if (!scopeItemId || !action) {
      return NextResponse.json(
        { error: 'Missing scope_item_id or action' },
        { status: 400 }
      );
    }

    if (action === 'confirm') {
      await confirmScopeItem(scopeItemId);

      return NextResponse.json({
        success: true,
        action: 'confirmed',
        scopeItemId,
      });
    } else if (action === 'delete') {
      await deleteScopeItem(scopeItemId);

      return NextResponse.json({
        success: true,
        action: 'deleted',
        scopeItemId,
      });
    } else if (action === 'edit' && description !== undefined) {
      const { updateScopeItem } = await import('@/shared/models/scope_item');
      await updateScopeItem(scopeItemId, { description });

      return NextResponse.json({
        success: true,
        action: 'edited',
        scopeItemId,
        description,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Review API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process review action' },
      { status: 500 }
    );
  }
}
