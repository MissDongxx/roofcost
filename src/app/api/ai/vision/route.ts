import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findPhotoById, updatePhoto } from '@/shared/models/photo';
import { getInspectionPhotos } from '@/shared/models/photo';
import { getZhipuVisionPrompt } from '@/lib/prompts';

// Zhipu API configuration
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

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
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: 'Missing photo_id' },
        { status: 400 }
      );
    }

    // Get photo record
    const photo = await findPhotoById(photoId);
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Use processed URL if available, otherwise use storage URL
    const imageUrl = photo.processedUrl || photo.storageUrl;

    // Get prompt based on photo type
    const prompt = getZhipuVisionPrompt(photo.photoType);

    // Call Zhipu GLM-4V API
    const response = await fetch(`${ZHIPU_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4v',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: prompt },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Vision API] Zhipu API error:', error);
      return NextResponse.json(
        { error: `Vision analysis failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const description = data.choices[0]?.message?.content || '';

    // TODO: Store description in observation table
    // For now, return it directly

    return NextResponse.json({
      success: true,
      photoId,
      photoType: photo.photoType,
      description,
      usage: data.usage,
    });
  } catch (error) {
    console.error('[Vision API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photo' },
      { status: 500 }
    );
  }
}

/**
 * Batch analyze all photos for an inspection
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

    if (!ZHIPU_API_KEY) {
      return NextResponse.json(
        { error: 'Zhipu API key not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const inspectionId = searchParams.get('inspection_id');

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id parameter' },
        { status: 400 }
      );
    }

    // Get all photos for inspection
    const photos = await getInspectionPhotos(inspectionId);

    // Process photos in parallel (max 3 concurrent)
    const results = [];
    const batchSize = 3;

    for (let i = 0; i < photos.length; i += batchSize) {
      const batch = photos.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(async (photo) => {
          const imageUrl = photo.processedUrl || photo.storageUrl;
          const prompt = getZhipuVisionPrompt(photo.photoType);

          const response = await fetch(`${ZHIPU_API_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${ZHIPU_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'glm-4v',
              messages: [
                {
                  role: 'user',
                  content: [
                    { type: 'image_url', image_url: { url: imageUrl } },
                    { type: 'text', text: prompt },
                  ],
                },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to analyze photo ${photo.id}`);
          }

          const data = await response.json();
          return {
            photoId: photo.id,
            photoType: photo.photoType,
            description: data.choices[0]?.message?.content || '',
            usage: data.usage,
          };
        })
      );

      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            error: result.reason?.message || 'Unknown error',
          });
        }
      });
    }

    return NextResponse.json({
      success: true,
      inspectionId,
      results,
      total: photos.length,
      processed: results.filter((r) => !r.error).length,
    });
  } catch (error) {
    console.error('[Vision API] Batch error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze photos' },
      { status: 500 }
    );
  }
}
