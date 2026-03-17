import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { nanoid } from 'nanoid';
import { getUserByEmail } from '@/shared/models/user';
import {
  createCredit,
  getUserCredits,
  getUserRemainingCredits,
} from '@/shared/models/credit';

/**
 * Grant free credits to a user (Admin only)
 * POST /api/admin/grant-credits
 * Body: { email: string, amount: number, validDays?: number, description?: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { email, amount, validDays, description } = body;

    if (!email || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid email or amount' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate expiration date
    let expiresAt: Date | undefined;
    if (validDays && validDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validDays);
    }

    // Grant credits
    const creditId = nanoid();
    const transactionNo = `GRANT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    await createCredit({
      id: creditId,
      userId: user.id,
      userEmail: user.email,
      transactionNo,
      transactionType: 'grant',
      transactionScene: 'beta_tester',
      credits: amount,
      remainingCredits: amount,
      description: description || `Beta tester grant: ${amount} credits`,
      expiresAt: expiresAt?.toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Get updated credit balance
    const remainingCredits = await getUserRemainingCredits(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      credit: {
        amount,
        expiresAt,
      },
      balance: {
        remaining: remainingCredits,
      },
      message: `Successfully granted ${amount} credits to ${email}`,
    });
  } catch (error) {
    console.error('[Grant Credits] Error:', error);
    return NextResponse.json(
      { error: 'Failed to grant credits' },
      { status: 500 }
    );
  }
}

/**
 * Get credit balance for a user
 * GET /api/admin/grant-credits?email=xxx
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
    const email = searchParams.get('email');

    if (!email) {
      // Return current user's credits
      const credits = await getUserCredits(session.user.id);
      const remainingCredits = await getUserRemainingCredits(session.user.id);

      return NextResponse.json({
        success: true,
        credits: {
          total: credits.length,
          remaining: remainingCredits,
          history: credits.map(c => ({
            id: c.id,
            transactionType: c.transactionType,
            credits: c.credits,
            remainingCredits: c.remainingCredits,
            description: c.description,
            status: c.status,
            expiresAt: c.expiresAt,
            createdAt: c.createdAt,
          })),
        },
      });
    }

    // Admin: Get specific user's credits
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const credits = await getUserCredits(user.id);
    const remainingCredits = await getUserRemainingCredits(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      credits: {
        total: credits.length,
        remaining: remainingCredits,
        history: credits.map(c => ({
          id: c.id,
          transactionType: c.transactionType,
          credits: c.credits,
          remainingCredits: c.remainingCredits,
          description: c.description,
          status: c.status,
          expiresAt: c.expiresAt,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('[Get Credits] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get credits' },
      { status: 500 }
    );
  }
}
