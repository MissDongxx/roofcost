import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db';
import { inspection } from '@/config/db/schema';

export type Inspection = typeof inspection.$inferSelect;
export type NewInspection = typeof inspection.$inferInsert;

export async function createInspection(
  newInspection: Omit<NewInspection, 'id' | 'createdAt' | 'updatedAt'>
) {
  const id = nanoid();
  const [result] = await db()
    .insert(inspection)
    .values({
      id,
      ...newInspection,
    })
    .returning();

  return result;
}

export async function findInspectionById(id: string) {
  const [result] = await db()
    .select()
    .from(inspection)
    .where(eq(inspection.id, id));

  return result;
}

export async function updateInspection(
  id: string,
  updatedInspection: Partial<Omit<NewInspection, 'id' | 'createdAt'>>
) {
  const [result] = await db()
    .update(inspection)
    .set(updatedInspection)
    .where(eq(inspection.id, id))
    .returning();

  return result;
}

export async function getUserInspections(userId: string) {
  const result = await db()
    .select()
    .from(inspection)
    .where(eq(inspection.userId, userId));

  return result;
}
