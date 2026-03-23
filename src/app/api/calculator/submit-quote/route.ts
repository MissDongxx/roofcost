import { NextResponse } from 'next/server';
import { db } from '@/core/db';
import { quoteSubmissions } from '@/config/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { 
      city, 
      stateCode, 
      zipCode, 
      materialType, 
      areaSqft, 
      actualQuote,
      quoteDate 
    } = body;

    if (!city || !stateCode || !materialType || !actualQuote) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db().insert(quoteSubmissions).values({
      city,
      stateCode: stateCode.toUpperCase(),
      zipCode: zipCode || null,
      materialType,
      areaSqft: areaSqft ? areaSqft.toString() : null,
      actualQuote: parseInt(actualQuote),
      quoteDate: quoteDate || new Date().toISOString().split('T')[0],
      dataSource: 'user_submit',
      isVerified: false,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Submit quote error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
