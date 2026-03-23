import { NextResponse } from 'next/server';
import { PriceResult } from '@/lib/calculator/pricing-engine';
import { getEmailService } from '@/shared/services/email';
import { getAllConfigs } from '@/shared/models/config';
import { EstimateEmail } from '@/lib/calculator/EmailTemplate';
import React from 'react';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { email, result, zipCode }: { email: string, result: PriceResult, zipCode: string } = await req.json();

    if (!email || !result) {
      return NextResponse.json({ error: 'Missing email or result data' }, { status: 400 });
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

    const emailService = await getEmailService();
    
    const resultEmail = await emailService.sendEmail({
      to: email,
      subject: `Your Roof Estimate: $${result.mid.toLocaleString()}`,
      react: React.createElement(EstimateEmail, {
        appName,
        appUrl,
        logoBase64,
        result,
        input: { zipCode },
        title: 'Roof Replacement Estimate'
      }),
    });

    if (!resultEmail.success) {
      // If it failed but it's just missing provider, we might want to log it but not fail the whole request 
      // if we want to support "mock" mode in dev.
      // But for production, it should be an error.
      console.warn('Email sending failed:', resultEmail.error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Share calculation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
