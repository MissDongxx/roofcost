import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { md5 } from '@/shared/lib/hash';

import { getAuth } from '@/core/auth';
import { createPhoto } from '@/shared/models/photo';
import { getStorageService } from '@/shared/services/storage';

const extFromMime = (mimeType: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mimeType] || 'jpg';
};

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const photoType = formData.get('photo_type') as string;
    const inspectionId = formData.get('inspection_id') as string;
    const gps = formData.get('gps') as string | null;

    if (!file || !photoType || !inspectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: file, photo_type, inspection_id' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const ext = extFromMime(file.type);
    const key = `inspections/${inspectionId}/${photoType}_${timestamp}.${ext}`;

    // Upload to storage
    const storageService = await getStorageService();
    const result = await storageService.uploadFile({
      body,
      key,
      contentType: file.type,
      disposition: 'inline',
    });

    if (!result.success) {
      console.error('[Photo Upload] Storage upload failed:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to upload to storage' },
        { status: 500 }
      );
    }

    // Create photo record in database
    const photoRecord = await createPhoto({
      inspectionId,
      photoType,
      storageUrl: result.url || key,
      gps: gps || null,
    });

    return NextResponse.json({
      id: photoRecord.id,
      storageUrl: photoRecord.storageUrl,
      photoType: photoRecord.photoType,
    });
  } catch (error) {
    console.error('[Photo Upload] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}
