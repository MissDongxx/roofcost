import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { RoofEstimatePDF } from '@/lib/calculator/PdfTemplate';

const resend = new Resend(process.env.RESEND_API_KEY || 're_fallback');

export async function POST(req: Request) {
  try {
    const { email, result, input } = await req.json();

    if (!email || !result || !input) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stream = await renderToStream(
      React.createElement(RoofEstimatePDF, { result, input })
    );

    const chunks = [];
    for await (const chunk of stream as any) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    await resend.emails.send({
      from: `RoofCost Calculator <${fromEmail}>`,
      to: email,
      subject: 'Your Roof Cost Estimate PDF',
      text: 'Thank you for using our calculator. Please find your comprehensive roof cost estimate attached.',
      attachments: [
        {
          filename: 'roof-estimate.pdf',
          content: pdfBuffer,
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
