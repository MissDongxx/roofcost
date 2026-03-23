import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { RoofEstimatePDF } from '@/lib/calculator/PdfTemplate';
import { getEmailService } from '@/shared/services/email';
import { getAllConfigs } from '@/shared/models/config';
import { EstimateEmail } from '@/lib/calculator/EmailTemplate';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, result, input } = await req.json();

    if (!email || !result || !input) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const configs = await getAllConfigs();
    const appUrl = configs.app_url || 'https://roofcostai.com';
    const appName = configs.app_name || 'RoofCostAI';
    let logoUrl = configs.app_logo || '/logo.png';
    
    if (logoUrl.startsWith('/')) {
      logoUrl = `${appUrl}${logoUrl}`;
    }

    // Read logo as base64 for embedding in email
    let logoBase64 = '';
    try {
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
    } catch (e) {
      console.error('Failed to read logo image for email embedding', e);
    }

    const stream = await renderToStream(
      React.createElement(RoofEstimatePDF, { 
        result, 
        input, 
        logoUrl, 
        appUrl, 
        appName 
      }) as any
    );

    const chunks = [];
    for await (const chunk of stream as any) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    const emailService = await getEmailService();
    
    const resultEmail = await emailService.sendEmail({
      to: email,
      subject: 'Your Roof Cost Estimate PDF',
      react: React.createElement(EstimateEmail, {
        appName,
        appUrl,
        logoBase64,
        result,
        input,
        title: 'Roof Replacement Estimate'
      }),
      attachments: [
        {
          filename: 'roof-estimate.pdf',
          content: pdfBuffer,
        },
      ],
    });

    if (!resultEmail.success) {
      throw new Error(resultEmail.error || 'Failed to send email');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
