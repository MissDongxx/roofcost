import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { getInspectionObservations } from '@/shared/models/observation';
import { getInspectionScopeItems, updateScopeItem } from '@/shared/models/scope_item';
import { getScopeDescriptionPrompt } from '@/lib/prompts';

// Zhipu API configuration
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

/**
 * Generate professional descriptions for scope items
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
    const { inspectionId, scopeItemIds } = body;

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id' },
        { status: 400 }
      );
    }

    // Get scope items to describe
    let scopeItems;
    if (scopeItemIds && Array.isArray(scopeItemIds)) {
      // Get specific scope items
      const allScopeItems = await getInspectionScopeItems(inspectionId);
      scopeItems = allScopeItems.filter((item) => scopeItemIds.includes(item.id));
    } else {
      // Get all pending scope items (without description)
      const allScopeItems = await getInspectionScopeItems(inspectionId);
      scopeItems = allScopeItems.filter((item) => !item.description);
    }

    if (!scopeItems || scopeItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scope items to describe',
        descriptions: [],
      });
    }

    // Get observations for context
    const observations = await getInspectionObservations(inspectionId);

    // Generate descriptions in batches (GLM-4-Plus supports longer context)
    const batchSize = 5;
    const results = [];

    for (let i = 0; i < scopeItems.length; i += batchSize) {
      const batch = scopeItems.slice(i, i + batchSize);

      // Prepare batch prompt
      const batchItems = batch.map((item) => {
        // Find relevant observations
        const relevantObs = observations.filter((obs) => {
          // Simple matching: same component or location
          return obs.component === item.xactimateCode || obs.location;
        });

        return {
          id: item.id,
          lineItem: item.lineItem,
          xactimateCode: item.xactimateCode,
          observations: relevantObs.map((obs) => ({
            damage: obs.damage,
            component: obs.component,
            location: obs.location,
            severity: obs.severity,
          })),
        };
      });

      const batchPrompt = `Generate professional roofing scope descriptions for the following items:

${batchItems
  .map(
    (item, idx) =>
      `${idx + 1}. ID: ${item.id}\n   Line Item: ${item.lineItem}\n   Xactimate: ${item.xactimateCode}\n   Observations: ${item.observations
        .map((o) => `${o.damage} on ${o.component}${o.location ? ` at ${o.location}` : ''}`)
        .join(', ')}`
  )
  .join('\n\n')}

Requirements:
1. Use professional roofing terminology
2. Be concise (1-2 sentences per item)
3. Only describe what was observed, do not add assumptions
4. Write in English
5. Include location and severity if relevant

Return ONLY a JSON object with this exact format:
{
  "descriptions": [
    {"id": "${batchItems[0].id}", "text": "description here"},
    {"id": "${batchItems[1].id}", "text": "description here"}
  ]
}`;

      // Call Zhipu GLM-4-Plus API with JSON mode
      const response = await fetch(`${ZHIPU_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ZHIPU_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-plus',
          messages: [
            {
              role: 'system',
              content: 'You are a professional roofing contractor generating scope descriptions. Always return valid JSON.',
            },
            {
              role: 'user',
              content: batchPrompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[Scope Describe API] Zhipu API error:', error);
        // Continue with next batch on error
        results.push(
          ...batch.map((item) => ({
            id: item.id,
            error: 'Failed to generate description',
          }))
        );
        continue;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';

      let batchResult: { descriptions: Array<{ id: string; text: string }> };
      try {
        batchResult = JSON.parse(content);
      } catch (error) {
        console.error('[Scope Describe API] Failed to parse JSON:', content);
        results.push(
          ...batch.map((item) => ({
            id: item.id,
            error: 'Failed to parse response',
          }))
        );
        continue;
      }

      // Update scope items with descriptions
      if (batchResult.descriptions && Array.isArray(batchResult.descriptions)) {
        for (const desc of batchResult.descriptions) {
          await updateScopeItem(desc.id, { description: desc.text });
          results.push({
            id: desc.id,
            description: desc.text,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      inspectionId,
      descriptions: results,
      total: scopeItems.length,
      generated: results.filter((r) => !r.error).length,
      usage: 'See individual batch responses',
    });
  } catch (error) {
    console.error('[Scope Describe API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scope descriptions' },
      { status: 500 }
    );
  }
}
