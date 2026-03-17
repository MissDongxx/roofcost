import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { nanoid } from 'nanoid';

// Feedback will be stored in a JSON file or sent to email
// For now, we'll log it and return success

/**
 * Submit user feedback
 * POST /api/feedback/submit
 * Body: {
 *   category: 'bug' | 'feature' | 'improvement' | 'other',
 *   rating?: number, // 1-5
 *   title: string,
 *   description: string,
 *   inspectionId?: string,
 *   metadata?: Record<string, any>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Allow anonymous feedback, but capture user info if logged in
    const userId = session?.user?.id || 'anonymous';
    const userEmail = session?.user?.email || 'anonymous';

    const body = await request.json();
    const { category, rating, title, description, inspectionId, metadata } = body;

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['bug', 'feature', 'improvement', 'other'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const feedbackId = nanoid();

    const feedback = {
      id: feedbackId,
      userId,
      userEmail,
      category,
      rating: rating || null,
      title,
      description,
      inspectionId: inspectionId || null,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || '',
      ip: request.headers.get('x-forwarded-for') || '',
    };

    // Log feedback (in production, you'd save to database or send to email)
    console.log('[Feedback] New submission:', JSON.stringify(feedback, null, 2));

    // TODO: Save to database or send email
    // await db.insert(feedbackTable).values(feedback);
    // OR send to slack/discord webhook

    return NextResponse.json({
      success: true,
      feedbackId,
      message: 'Thank you for your feedback! We appreciate your input.',
    });
  } catch (error) {
    console.error('[Feedback Submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * Get feedback statistics (Admin only)
 * GET /api/feedback/submit?stats=true
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

    // TODO: Add admin role check
    // const isAdmin = await checkUserRole(session.user.id, 'admin');
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats');

    if (stats === 'true') {
      // Return mock statistics (in production, query from database)
      return NextResponse.json({
        success: true,
        statistics: {
          total: 0,
          byCategory: {
            bug: 0,
            feature: 0,
            improvement: 0,
            other: 0,
          },
          averageRating: 0,
          thisWeek: 0,
          thisMonth: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      feedback: [],
    });
  } catch (error) {
    console.error('[Feedback Get] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get feedback' },
      { status: 500 }
    );
  }
}
