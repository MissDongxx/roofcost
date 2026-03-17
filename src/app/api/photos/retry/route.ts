import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findPhotoById, updatePhoto } from '@/shared/models/photo';
import { deleteObservationByPhotoId, createObservation } from '@/shared/models/observation';

// Zhipu API configuration
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

/**
 * Retry processing a single photo
 * POST /api/photos/retry
 * Body: { photoId: string, inspectionId: string }
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
    const { photoId, inspectionId } = body;

    if (!photoId || !inspectionId) {
      return NextResponse.json(
        { error: 'Missing photo_id or inspection_id' },
        { status: 400 }
      );
    }

    // Get photo
    const photo = await findPhotoById(photoId);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Get prompt based on photo type
    const getVisionPrompt = (photoType: string): string => {
      const prompts: Record<string, string> = {
        north_slope: '分析这张屋顶北坡照片。请详细描述屋面材质状况、可见损坏类型和严重程度。',
        south_slope: '分析这张屋顶南坡照片。请详细描述屋面材质状况、可见损坏类型和严重程度。',
        east_slope: '分析这张屋顶东坡照片。请详细描述屋面材质状况、可见损坏类型和严重程度。',
        west_slope: '分析这张屋顶西坡照片。请详细描述屋面材质状况、可见损坏类型和严重程度。',
        flashing_chimney: '分析这张烟囱泛水照片。请重点关注泛水是否完整、有无锈蚀、与烟囱和屋面的接合是否紧密。',
        flashing_valley: '分析这张屋谷泛水照片。请检查泛水金属是否完整、有无锈蚀、接缝是否紧密。',
        flashing_wall: '分析这张墙面泛水照片。请检查泛水与墙面和屋面的接合是否紧密。',
        vent_flashing: '分析这张通风口泛水照片。请检查泛水是否完整、有无破损。',
        ridge_cap: '分析这张屋脊照片。请检查屋脊瓦是否完整、有无缺失或开裂。',
        fascia: '分析这张檐口板照片。请检查是否有腐朽、损坏或油漆剥落。',
        soffit: '分析这张底板照片。请检查是否有腐朽、损坏或通风口堵塞。',
        gutter: '分析这张排水沟照片。请检查是否有锈蚀、松动、脱落或堵塞。',
      };
      return prompts[photoType] || '分析这张屋顶照片，请详细描述可见的损坏和问题。';
    };

    const imageUrl = photo.processedUrl || photo.storageUrl;
    const visionPrompt = getVisionPrompt(photo.photoType);

    // Step 1: Vision Analysis
    let visionResult;
    try {
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
                { type: 'text', text: visionPrompt },
              ],
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vision API failed: ${response.statusText}`);
      }

      const data = await response.json();
      visionResult = {
        photoId: photo.id,
        photoType: photo.photoType,
        description: data.choices[0]?.message?.content || '',
      };
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Vision analysis failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Step 2: Classification
    const CLASSIFICATION_SYSTEM_PROMPT = `你是一个屋顶损坏分类专家。请将AI Vision的描述转换为结构化的JSON格式。

有效的组件值（component）：
- shingle, shingles, roof_surface（屋面瓦片）
- flashing, chimney_flashing, valley_flashing, wall_flashing（泛水）
- vent_flashing, vent_pipe_flashing（通风管泛水）
- fascia, soffit, gutter（檐口、底板、排水沟）
- ridge_cap（屋脊）

有效的损坏类型（damage）：
- missing, absent（缺失）
- cracked, broken（开裂）
- rusted, corroded（锈蚀）
- separated, loose（分离/松动）
- deteriorated, worn（老化）
- rotted, soft（腐朽）

严重程度（severity）：low, moderate, high, critical

只返回JSON，格式：{"component": "...", "damage": "...", "severity": "...", "location": "...", "confidence": "..."}`;

    let classificationResult;
    try {
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
              content: `分类以下描述：${visionResult.description}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Classification API failed: ${response.statusText}`);
      }

      const data = await response.json();
      const classification = JSON.parse(data.choices[0]?.message?.content || '{}');

      classificationResult = {
        photoId: photo.id,
        inspectionId,
        component: classification.component || null,
        damage: classification.damage || null,
        severity: classification.severity || null,
        location: classification.location || null,
        rawDescription: visionResult.description,
        confidence: classification.confidence || 'medium',
      };
    } catch (error) {
      // If classification fails, still save the vision result
      classificationResult = {
        photoId: photo.id,
        inspectionId,
        component: null,
        damage: null,
        severity: null,
        location: null,
        rawDescription: visionResult.description,
        confidence: 'low',
      };
    }

    // Delete old observation for this photo (if any)
    await deleteObservationByPhotoId(photoId);

    // Create new observation
    await createObservation(classificationResult);

    return NextResponse.json({
      success: true,
      photoId,
      observation: classificationResult,
      message: 'Photo reprocessed successfully',
    });
  } catch (error) {
    console.error('[Photo Retry] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retry photo processing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get retry status for a photo
 * GET /api/photos/retry?photo_id=xxx
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
    const photoId = searchParams.get('photo_id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Missing photo_id parameter' },
        { status: 400 }
      );
    }

    const photo = await findPhotoById(photoId);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: photo.id,
        photoType: photo.photoType,
        storageUrl: photo.storageUrl,
        processedUrl: photo.processedUrl,
        annotatedUrl: photo.annotatedUrl,
        needsRetry: !photo.processedUrl,
      },
    });
  } catch (error) {
    console.error('[Photo Retry Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get photo status' },
      { status: 500 }
    );
  }
}
