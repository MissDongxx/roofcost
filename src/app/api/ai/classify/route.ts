import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { CLASSIFICATION_SYSTEM_PROMPT } from '@/lib/prompts';

// Zhipu API configuration
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

/**
 * Classify a single vision description into structured JSON
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

    if (!ZHIPU_API_KEY) {
      return NextResponse.json(
        { error: 'Zhipu API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { rawDescription, photoType } = body;

    if (!rawDescription) {
      return NextResponse.json(
        { error: 'Missing raw_description' },
        { status: 400 }
      );
    }

    // Prepare the prompt
    const userPrompt = photoType
      ? `分类以下屋顶损坏描述：${rawDescription}\n\n照片类型：${photoType}`
      : `分类以下屋顶损坏描述：${rawDescription}`;

    // Call Zhipu GLM-4-Flash API with JSON mode
    const response = await fetch(`${ZHIPU_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: CLASSIFICATION_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Classify API] Zhipu API error:', error);
      return NextResponse.json(
        { error: `Classification failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';

    let classification: any;
    try {
      classification = JSON.parse(content);
    } catch (error) {
      console.error('[Classify API] Failed to parse JSON:', content);
      return NextResponse.json(
        { error: 'Failed to parse classification result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      classification: {
        component: classification.component || null,
        damage: classification.damage || null,
        severity: classification.severity || null,
        location: classification.location || null,
        confidence: classification.confidence || 'medium',
      },
      usage: data.usage,
    });
  } catch (error) {
    console.error('[Classify API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to classify observation' },
      { status: 500 }
    );
  }
}
