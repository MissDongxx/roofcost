import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

import { getAuth } from '@/core/auth';
import { findPhotoById, updatePhoto } from '@/shared/models/photo';
import { getStorageService } from '@/shared/services/storage';

const MAXDimension = 2048;

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
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json(
        { error: 'Missing photo_id' },
        { status: 400 }
      );
    }

    // Get photo record
    const photoRecord = await findPhotoById(photoId);
    if (!photoRecord) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Skip if already processed
    if (photoRecord.processedUrl) {
      return NextResponse.json({
        success: true,
        processedUrl: photoRecord.processedUrl,
      });
    }

    // Fetch the original image from storage
    const storageService = await getStorageService();
    const originalUrl = photoRecord.storageUrl;

    // Download the image
    const response = await fetch(originalUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch original image' },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer());

    // Process with sharp
    const processedImage = await sharp(imageBuffer)
      .resize(MAXDimension, MAXDimension, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .normalize()
      .toBuffer();

    // Upload processed image
    const processedKey = `inspections/${photoRecord.inspectionId}/processed/${photoId}.jpg`;
    const uploadResult = await storageService.uploadFile({
      body: new Uint8Array(processedImage),
      key: processedKey,
      contentType: 'image/jpeg',
      disposition: 'inline',
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload processed image' },
        { status: 500 }
      );
    }

    // Update photo record with processed URL
    await updatePhoto(photoId, {
      processedUrl: uploadResult.url || processedKey,
    });

    return NextResponse.json({
      success: true,
      processedUrl: uploadResult.url,
    });
  } catch (error) {
    console.error('[Photo Process] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process photo' },
      { status: 500 }
    );
  }
}
