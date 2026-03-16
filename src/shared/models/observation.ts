import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db';
import { observation } from '@/config/db/schema';

export type Observation = typeof observation.$inferSelect;
export type NewObservation = typeof observation.$inferInsert;

/**
 * Create a new observation record
 */
export async function createObservation(
  newObservation: Omit<NewObservation, 'id'>
) {
  const id = nanoid();
  const [result] = await db()
    .insert(observation)
    .values({
      id,
      ...newObservation,
    })
    .returning();

  return result;
}

/**
 * Find observation by ID
 */
export async function findObservationById(id: string) {
  const [result] = await db()
    .select()
    .from(observation)
    .where(eq(observation.id, id));

  return result;
}

/**
 * Get all observations for an inspection
 */
export async function getInspectionObservations(inspectionId: string) {
  const result = await db()
    .select()
    .from(observation)
    .where(eq(observation.inspectionId, inspectionId));

  return result;
}

/**
 * Get all observations for a photo
 */
export async function getPhotoObservations(photoId: string) {
  const result = await db()
    .select()
    .from(observation)
    .where(eq(observation.photoId, photoId));

  return result;
}

/**
 * Update observation
 */
export async function updateObservation(
  id: string,
  updatedObservation: Partial<Omit<NewObservation, 'id'>>
) {
  const [result] = await db()
    .update(observation)
    .set(updatedObservation)
    .where(eq(observation.id, id))
    .returning();

  return result;
}

/**
 * Delete observation
 */
export async function deleteObservation(id: string) {
  await db()
    .delete(observation)
    .where(eq(observation.id, id));
}

/**
 * Create multiple observations in batch
 */
export async function createObservationsBatch(
  observations: Omit<NewObservation, 'id'>[]
) {
  const records = observations.map((obs) => ({
    id: nanoid(),
    ...obs,
  }));

  const result = await db()
    .insert(observation)
    .values(records)
    .returning();

  return result;
}

/**
 * Get observations with photo details for an inspection
 */
export async function getInspectionObservationsWithPhotos(inspectionId: string) {
  const result = await db()
    .select({
      id: observation.id,
      photoId: observation.photoId,
      inspectionId: observation.inspectionId,
      component: observation.component,
      damage: observation.damage,
      severity: observation.severity,
      location: observation.location,
      rawDescription: observation.rawDescription,
      confidence: observation.confidence,
    })
    .from(observation)
    .where(eq(observation.inspectionId, inspectionId));

  return result;
}
