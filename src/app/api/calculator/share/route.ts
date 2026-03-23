import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { PriceResult } from '@/lib/calculator/pricing-engine';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(req: Request) {
  try {
    const { email, result, zipCode }: { email: string, result: PriceResult, zipCode: string } = await req.json();

    if (!email || !result) {
      return NextResponse.json({ error: 'Missing email or result data' }, { status: 400 });
    }

    const htmlContent = `
      <h1>Your Roof Replacement Estimate</h1>
      <p>Based on our pricing engine for ZIP code ${zipCode}, here is your estimated cost for a ${result.materialName} roof.</p>
      
      <h2>Estimated Total: $${result.mid.toLocaleString()}</h2>
      <p>Typical range: $${result.low.toLocaleString()} to $${result.high.toLocaleString()}</p>
      
      <h3>Cost Breakdown:</h3>
      <ul>
        <li>Materials: $${result.breakdown.materialCost.toLocaleString()}</li>
        <li>Labor: $${result.breakdown.laborCost.toLocaleString()}</li>
        <li>Tear-off: $${result.breakdown.tearoffCost.toLocaleString()}</li>
        <li>Disposal: $${result.breakdown.disposalCost.toLocaleString()}</li>
        <li>Permits: $${result.breakdown.permitCost.toLocaleString()}</li>
      </ul>
      
      <p>Need competitive quotes from local pros? Reply to this email!</p>
    `;

    // Only send if we have a real key, otherwise just mock success for local dev
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'RoofCost Calculator <estimates@roofcost.ai>',
        to: email,
        subject: `Your Roof Estimate: $${result.mid.toLocaleString()}`,
        html: htmlContent,
      });
    } else {
      console.log('Mock email sent (No RESEND_API_KEY configured):', htmlContent);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Share calculation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
