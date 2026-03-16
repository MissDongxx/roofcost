import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db';
import { photo } from '@/config/db/schema';

export type Photo = typeof photo.$inferSelect;
export type NewPhoto = typeof photo.$inferInsert;

export async function createPhoto(newPhoto: Omit<NewPhoto, 'id' | 'uploadedAt'>) {
  const id = nanoid();
  const [result] = await db()
    .insert(photo)
    .values({
      id,
      ...newPhoto,
    })
    .returning();

  return result;
}

export async function findPhotoById(id: string) {
  const [result] = await db()
    .select()
    .from(photo)
    .where(eq(photo.id, id));

  return result;
}

export async function updatePhoto(
  id: string,
  updatedPhoto: Partial<Omit<NewPhoto, 'id' | 'uploadedAt'>>
) {
  const [result] = await db()
    .update(photo)
    .set(updatedPhoto)
    .where(eq(photo.id, id))
    .returning();

  return result;
}

export async function getInspectionPhotos(inspectionId: string) {
  const result = await db()
    .select()
    .from(photo)
    .where(eq(photo.inspectionId, inspectionId));

  return result;
}
