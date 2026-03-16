import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { findInspectionById, updateInspection } from '@/shared/models/inspection';
import { getInspectionPhotos } from '@/shared/models/photo';
import {
  createObservation,
  getInspectionObservations,
} from '@/shared/models/observation';
import { getInspectionScopeItems } from '@/shared/models/scope_item';
import { updatePhoto } from '@/shared/models/photo';

// Zhipu API configuration
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
const ZHIPU_API_BASE = process.env.ZHIPU_API_BASE || 'https://open.bigmodel.cn/api/paas/v4';

interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
  result?: any;
  startedAt?: Date;
  completedAt?: Date;
}

interface PipelineProgress {
  inspectionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  steps: PipelineStep[];
  currentStep: number;
  totalSteps: number;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Vision API: Analyze photos with GLM-4V
 */
async function stepVisionAnalysis(
  inspectionId: string,
  photos: any[],
  progress: PipelineProgress
): Promise<PipelineStep> {
  const step: PipelineStep = {
    name: 'Vision Analysis',
    status: 'running',
    startedAt: new Date(),
  };

  try {
    const getZhipuVisionPrompt = (photoType: string): string => {
      const prompts: Record<string, string> = {
        north_slope: '分析这张屋顶北坡照片。请详细描述屋面材质状况、可见损坏类型和严重程度。',
        south_slope: '分析这张屋顶南坡照片。请详细描述屋面材质状况、可见损坏类型和严重程度。',
        flashing_chimney: '分析这张烟囱泛水照片。请重点关注泛水是否完整、有无锈蚀、与烟囱和屋面的接合是否紧密。',
        flashing_valley: '分析这张屋谷泛水照片。请检查泛水金属是否完整、有无锈蚀、接缝是否紧密。',
        // ... add more prompts as needed
      };
      return prompts[photoType] || '分析这张屋顶照片，请详细描述可见的损坏和问题。';
    };

    // Process photos in batches of 3
    const batchSize = 3;
    const results = [];

    for (let i = 0; i < photos.length; i += batchSize) {
      const batch = photos.slice(i, i + batchSize);

      const batchPromises = batch.map(async (photo) => {
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
        };
      });

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('[Pipeline] Vision batch error:', result.reason);
          // Continue processing other photos
        }
      }
    }

    step.status = 'completed';
    step.completedAt = new Date();
    step.result = {
      totalPhotos: photos.length,
      processedPhotos: results.length,
      descriptions: results,
    };

    return step;
  } catch (error) {
    step.status = 'failed';
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : 'Unknown error';
    return step;
  }
}

/**
 * Classification: Convert descriptions to structured JSON
 */
async function stepClassification(
  inspectionId: string,
  visionResults: any[],
  progress: PipelineProgress
): Promise<PipelineStep> {
  const step: PipelineStep = {
    name: 'Classification',
    status: 'running',
    startedAt: new Date(),
  };

  try {
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

    const classifications = [];

    // Process in batches
    const batchSize = 5;
    for (let i = 0; i < visionResults.length; i += batchSize) {
      const batch = visionResults.slice(i, i + batchSize);

      const batchPromises = batch.map(async (visionResult) => {
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
          throw new Error(`Classification failed for photo ${visionResult.photoId}`);
        }

        const data = await response.json();
        const classification = JSON.parse(data.choices[0]?.message?.content || '{}');

        return {
          photoId: visionResult.photoId,
          inspectionId,
          component: classification.component || null,
          damage: classification.damage || null,
          severity: classification.severity || null,
          location: classification.location || null,
          rawDescription: visionResult.description,
          confidence: classification.confidence || 'medium',
        };
      });

      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          classifications.push(result.value);
          // Create observation record
          await createObservation(result.value);
        } else {
          console.error('[Pipeline] Classification batch error:', result.reason);
        }
      }
    }

    step.status = 'completed';
    step.completedAt = new Date();
    step.result = {
      totalObservations: classifications.length,
      classifications,
    };

    return step;
  } catch (error) {
    step.status = 'failed';
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : 'Unknown error';
    return step;
  }
}

/**
 * Rule Engine: Generate scope items from observations
 */
async function stepRuleEngine(
  inspectionId: string,
  progress: PipelineProgress
): Promise<PipelineStep> {
  const step: PipelineStep = {
    name: 'Rule Engine',
    status: 'running',
    startedAt: new Date(),
  };

  try {
    // Call rule engine API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rule-engine`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId }),
      }
    );

    if (!response.ok) {
      throw new Error('Rule engine failed');
    }

    const data = await response.json();

    step.status = 'completed';
    step.completedAt = new Date();
    step.result = data;

    return step;
  } catch (error) {
    step.status = 'failed';
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : 'Unknown error';
    return step;
  }
}

/**
 * Scope Description: Generate professional descriptions
 */
async function stepScopeDescription(
  inspectionId: string,
  progress: PipelineProgress
): Promise<PipelineStep> {
  const step: PipelineStep = {
    name: 'Scope Description',
    status: 'running',
    startedAt: new Date(),
  };

  try {
    // Call scope describe API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/scope-describe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionId }),
      }
    );

    if (!response.ok) {
      throw new Error('Scope description failed');
    }

    const data = await response.json();

    step.status = 'completed';
    step.completedAt = new Date();
    step.result = data;

    return step;
  } catch (error) {
    step.status = 'failed';
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : 'Unknown error';
    return step;
  }
}

/**
 * Photo Annotation: Add bounding boxes to photos
 */
async function stepPhotoAnnotation(
  inspectionId: string,
  progress: PipelineProgress
): Promise<PipelineStep> {
  const step: PipelineStep = {
    name: 'Photo Annotation',
    status: 'running',
    startedAt: new Date(),
  };

  try {
    // Get observations for annotation
    const observations = await getInspectionObservations(inspectionId);

    // Get photos
    const photos = await getInspectionPhotos(inspectionId);

    // Annotate photos that have observations
    const annotatePromises = photos.map(async (photo) => {
      const photoObservations = observations.filter((obs) => obs.photoId === photo.id);

      if (photoObservations.length > 0 && !photo.annotatedUrl) {
        // Use first observation for annotation (MVP approach)
        const obs = photoObservations[0];

        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/photos/annotate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              photoId: photo.id,
              component: obs.component,
              damage: obs.damage,
              severity: obs.severity,
            }),
          }
        );
      }
    });

    await Promise.allSettled(annotatePromises);

    step.status = 'completed';
    step.completedAt = new Date();
    step.result = {
      annotatedPhotos: observations.length,
    };

    return step;
  } catch (error) {
    step.status = 'failed';
    step.completedAt = new Date();
    step.error = error instanceof Error ? error.message : 'Unknown error';
    return step;
  }
}

/**
 * Run complete AI pipeline for an inspection
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
    const { inspectionId } = body;

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id' },
        { status: 400 }
      );
    }

    // Get inspection
    const inspection = await findInspectionById(inspectionId);
    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    // Check status
    if (inspection.status === 'processing') {
      return NextResponse.json(
        { error: 'Inspection is already being processed' },
        { status: 400 }
      );
    }

    // Get photos
    const photos = await getInspectionPhotos(inspectionId);
    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No photos found for this inspection' },
        { status: 400 }
      );
    }

    // Update inspection status to processing
    await updateInspection(inspectionId, { status: 'processing' });

    // Initialize pipeline progress
    const progress: PipelineProgress = {
      inspectionId,
      status: 'running',
      steps: [],
      currentStep: 0,
      totalSteps: 5,
      startedAt: new Date(),
    };

    // Step 1: Vision Analysis
    progress.currentStep = 1;
    progress.steps.push(
      await stepVisionAnalysis(inspectionId, photos, progress)
    );

    // Step 2: Classification
    progress.currentStep = 2;
    const visionResults = progress.steps[0].result?.descriptions || [];
    progress.steps.push(
      await stepClassification(inspectionId, visionResults, progress)
    );

    // Step 3: Rule Engine
    progress.currentStep = 3;
    progress.steps.push(await stepRuleEngine(inspectionId, progress));

    // Step 4: Scope Description
    progress.currentStep = 4;
    progress.steps.push(await stepScopeDescription(inspectionId, progress));

    // Step 5: Photo Annotation
    progress.currentStep = 5;
    progress.steps.push(await stepPhotoAnnotation(inspectionId, progress));

    // Check if all steps completed
    const allCompleted = progress.steps.every(
      (step) => step.status === 'completed'
    );

    progress.status = allCompleted ? 'completed' : 'failed';
    progress.completedAt = new Date();

    // Update inspection status
    await updateInspection(inspectionId, {
      status: allCompleted ? 'review' : 'processing',
    });

    // Get final scope items
    const scopeItems = await getInspectionScopeItems(inspectionId);

    return NextResponse.json({
      success: true,
      inspectionId,
      progress,
      scopeItems: {
        total: scopeItems.length,
        items: scopeItems,
      },
      message: allCompleted
        ? 'AI pipeline completed successfully'
        : 'AI pipeline completed with some errors',
    });
  } catch (error) {
    console.error('[Pipeline] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run AI pipeline' },
      { status: 500 }
    );
  }
}

/**
 * Get pipeline status for an inspection
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
    const inspectionId = searchParams.get('inspection_id');

    if (!inspectionId) {
      return NextResponse.json(
        { error: 'Missing inspection_id parameter' },
        { status: 400 }
      );
    }

    const inspection = await findInspectionById(inspectionId);
    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspection not found' },
        { status: 404 }
      );
    }

    const scopeItems = await getInspectionScopeItems(inspectionId);
    const observations = await getInspectionObservations(inspectionId);

    return NextResponse.json({
      success: true,
      inspection: {
        id: inspection.id,
        status: inspection.status,
        address: inspection.address,
        roofType: inspection.roofType,
      },
      scopeItems: {
        total: scopeItems.length,
        confirmed: scopeItems.filter((item) => item.confirmed).length,
        pending: scopeItems.filter((item) => !item.confirmed && !item.deleted).length,
        items: scopeItems,
      },
      observations: {
        total: observations.length,
        items: observations,
      },
    });
  } catch (error) {
    console.error('[Pipeline] Status error:', error);
    return NextResponse.json(
      { error: 'Failed to get pipeline status' },
      { status: 500 }
    );
  }
}
