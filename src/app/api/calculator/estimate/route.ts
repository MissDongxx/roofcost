import { NextResponse } from 'next/server';
import { calculateRoofCost, CalculatorInput } from '@/lib/calculator/pricing-engine';
import { db } from '@/core/db';
import { calculations } from '@/config/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    const { 
      zipCode, 
      areaSqft, 
      materialType, 
      pitchFactor, 
      complexity, 
      includeTearoff 
    } = body as CalculatorInput;

    if (!zipCode || !areaSqft || !materialType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call pricing engine
    const result = await calculateRoofCost({
      zipCode,
      areaSqft,
      materialType,
      pitchFactor: pitchFactor || 1.0,
      complexity: complexity || 'simple',
      includeTearoff: includeTearoff ?? true
    });

    // Save calculation record to database asynchronously
    // We don't await this so the API responds faster
    try {
      // In Next.js App Router, floating promises in the same request context might end early.
      // Easiest is to await it, or use waitUntil if deployed to Vercel edge/lambda securely.
      // Since typical DB inserts are fast (<50ms), we just await it to guarantee insertion.
      await db().insert(calculations).values({
        zipCode,
        stateCode: zipCode, // simple mapping for now, assuming geo index could refine it
        materialType,
        areaSqft: areaSqft.toString(),
        pitchFactor: (pitchFactor || 1.0).toString(),
        complexity: complexity || 'simple',
        includeTearoff: includeTearoff ?? true,
        resultLow: result.low,
        resultMid: result.mid,
        resultHigh: result.high,
      });
    } catch (dbError) {
      console.error('Failed to save calculation to DB:', dbError);
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error: any) {
    console.error('Estimate error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
