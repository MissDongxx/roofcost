import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { getAuth } from '@/core/auth';
import { findPhotoById, updatePhoto } from '@/shared/models/photo';
import { getStorageService } from '@/shared/services/storage';

/**
 * Component-based bounding box positions
 * For MVP, we use general positions based on component type
 */
const COMPONENT_POSITIONS: Record<string, { top: number; left: number; width: number; height: number }> = {
  // Roof surface - center area
  shingle: { top: 200, left: 200, width: 400, height: 300 },
  shingles: { top: 200, left: 200, width: 400, height: 300 },
  roof_surface: { top: 200, left: 200, width: 400, height: 300 },

  // Chimney flashing - upper area
  chimney_flashing: { top: 100, left: 300, width: 300, height: 200 },
  flashing_chimney: { top: 100, left: 300, width: 300, height: 200 },

  // Valley flashing - diagonal area
  valley_flashing: { top: 150, left: 250, width: 350, height: 300 },
  flashing_valley: { top: 150, left: 250, width: 350, height: 300 },

  // Wall flashing - side area
  wall_flashing: { top: 200, left: 100, width: 200, height: 300 },
  sidewall_flashing: { top: 200, left: 100, width: 200, height: 300 },
  step_flashing: { top: 200, left: 100, width: 200, height: 300 },

  // Vent flashing - scattered
  vent_flashing: { top: 180, left: 280, width: 150, height: 150 },
  vent_pipe_flashing: { top: 180, left: 280, width: 150, height: 150 },
  pipe_boot: { top: 180, left: 280, width: 150, height: 150 },

  // Fascia - bottom edge
  fascia: { top: 450, left: 150, width: 500, height: 80 },
  fascia_board: { top: 450, left: 150, width: 500, height: 80 },

  // Soffit - bottom
  soffit: { top: 480, left: 150, width: 500, height: 60 },

  // Gutter - bottom edge
  gutter: { top: 500, left: 150, width: 500, height: 50 },

  // Ridge - top
  ridge_cap: { top: 50, left: 200, width: 400, height: 80 },
  ridge_vent: { top: 50, left: 200, width: 400, height: 80 },

  // Skylight - upper area
  skylight: { top: 120, left: 250, width: 250, height: 200 },
  roof_window: { top: 120, left: 250, width: 250, height: 200 },

  // Default - center
  default: { top: 200, left: 200, width: 300, height: 200 },
};

/**
 * Get bounding box position for a component
 */
function getBoundingBoxPosition(component?: string | null) {
  if (!component) return COMPONENT_POSITIONS.default;

  const componentLower = component.toLowerCase().replace(/\s+/g, '_');

  for (const [key, position] of Object.entries(COMPONENT_POSITIONS)) {
    if (componentLower.includes(key) || key.includes(componentLower)) {
      return position;
    }
  }

  return COMPONENT_POSITIONS.default;
}

/**
 * Create a bounding box overlay with label
 */
async function createBoundingBoxOverlay(
  imageWidth: number,
  imageHeight: number,
  component?: string | null,
  damage?: string | null,
  severity?: string | null
): Promise<Buffer> {
  const position = getBoundingBoxPosition(component);

  // Scale position based on image size
  const scaleX = imageWidth / 800; // Base width
  const scaleY = imageHeight / 600; // Base height

  const x = Math.round(position.left * scaleX);
  const y = Math.round(position.top * scaleY);
  const width = Math.round(position.width * scaleX);
  const height = Math.round(position.height * scaleY);

  // Create an SVG overlay
  const label = damage ? `${component || 'Damage'}: ${damage}` : component || 'Area';
  const severityColors: Record<string, string> = {
    low: '#00FF00',      // Green
    moderate: '#FFA500', // Orange
    high: '#FF0000',     // Red
    critical: '#8B0000', // Dark Red
  };

  const boxColor = severity && severityColors[severity]
    ? severityColors[severity]
    : '#FF0000';

  const svg = `
    <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${height}"
        fill="none"
        stroke="${boxColor}"
        stroke-width="4"
        stroke-dasharray="8,4"
      />
      <rect
        x="${x}"
        y="${Math.max(0, y - 30)}"
        width="${Math.min(width + 20, label.length * 9)}"
        height="30"
        fill="${boxColor}"
        opacity="0.9"
      />
      <text
        x="${x + 10}"
        y="${Math.max(20, y - 10)}"
        font-family="Arial, sans-serif"
        font-size="16"
        font-weight="bold"
        fill="white"
      >${label}</text>
    </svg>
  `;

  return Buffer.from(svg);
}

/**
 * Annotate a photo with bounding boxes based on observations
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

    const body = await request.json();
    const { photoId, component, damage, severity } = body;

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

    // Check if already annotated
    if (photo.annotatedUrl) {
      return NextResponse.json({
        success: true,
        annotatedUrl: photo.annotatedUrl,
        message: 'Photo already annotated',
      });
    }

    // Use processed image if available
    const imageUrl = photo.processedUrl || photo.storageUrl;

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Get image dimensions
    const metadata = await sharp(imageBuffer).metadata();
    const imageWidth = metadata.width || 800;
    const imageHeight = metadata.height || 600;

    // Create bounding box overlay
    const overlayBuffer = await createBoundingBoxOverlay(
      imageWidth,
      imageHeight,
      component,
      damage,
      severity
    );

    // Compose image with overlay
    const annotatedImage = await sharp(imageBuffer)
      .composite([
        {
          input: overlayBuffer,
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    // Upload annotated image
    const storageService = await getStorageService();
    const annotatedKey = `inspections/${photo.inspectionId}/annotated/${photoId}.jpg`;
    const uploadResult = await storageService.uploadFile({
      body: new Uint8Array(annotatedImage),
      key: annotatedKey,
      contentType: 'image/jpeg',
      disposition: 'inline',
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload annotated image' },
        { status: 500 }
      );
    }

    // Update photo record
    await updatePhoto(photoId, {
      annotatedUrl: uploadResult.url || annotatedKey,
    });

    return NextResponse.json({
      success: true,
      photoId,
      annotatedUrl: uploadResult.url,
    });
  } catch (error) {
    console.error('[Photo Annotate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to annotate photo' },
      { status: 500 }
    );
  }
}
