import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db';
import { scopeItem } from '@/config/db/schema';

export type ScopeItem = typeof scopeItem.$inferSelect;
export type NewScopeItem = typeof scopeItem.$inferInsert;

/**
 * Create a new scope item
 */
export async function createScopeItem(
  newScopeItem: Omit<NewScopeItem, 'id' | 'createdAt'>
) {
  const id = nanoid();
  const [result] = await db()
    .insert(scopeItem)
    .values({
      id,
      ...newScopeItem,
    })
    .returning();

  return result;
}

/**
 * Find scope item by ID
 */
export async function findScopeItemById(id: string) {
  const [result] = await db()
    .select()
    .from(scopeItem)
    .where(eq(scopeItem.id, id));

  return result;
}

/**
 * Get all scope items for an inspection
 */
export async function getInspectionScopeItems(inspectionId: string) {
  const result = await db()
    .select()
    .from(scopeItem)
    .where(and(
      eq(scopeItem.inspectionId, inspectionId),
      eq(scopeItem.deleted, false)
    ));

  return result;
}

/**
 * Get all scope items for an inspection (including deleted)
 */
export async function getInspectionScopeItemsAll(inspectionId: string) {
  const result = await db()
    .select()
    .from(scopeItem)
    .where(eq(scopeItem.inspectionId, inspectionId));

  return result;
}

/**
 * Update scope item
 */
export async function updateScopeItem(
  id: string,
  updates: Partial<Omit<NewScopeItem, 'id' | 'createdAt'>>
) {
  const [result] = await db()
    .update(scopeItem)
    .set(updates)
    .where(eq(scopeItem.id, id))
    .returning();

  return result;
}

/**
 * Confirm a scope item
 */
export async function confirmScopeItem(id: string) {
  const [result] = await db()
    .update(scopeItem)
    .set({ confirmed: true })
    .where(eq(scopeItem.id, id))
    .returning();

  return result;
}

/**
 * Mark a scope item as deleted (soft delete)
 */
export async function deleteScopeItem(id: string) {
  const [result] = await db()
    .update(scopeItem)
    .set({ deleted: true })
    .where(eq(scopeItem.id, id))
    .returning();

  return result;
}

/**
 * Permanently delete a scope item
 */
export async function hardDeleteScopeItem(id: string) {
  await db()
    .delete(scopeItem)
    .where(eq(scopeItem.id, id));
}

/**
 * Create multiple scope items in batch
 */
export async function createScopeItemsBatch(
  items: Omit<NewScopeItem, 'id' | 'createdAt'>[]
) {
  const records = items.map((item) => ({
    id: nanoid(),
    ...item,
  }));

  const result = await db()
    .insert(scopeItem)
    .values(records)
    .returning();

  return result;
}

/**
 * Get confirmed scope items for an inspection
 */
export async function getConfirmedScopeItems(inspectionId: string) {
  const result = await db()
    .select()
    .from(scopeItem)
    .where(and(
      eq(scopeItem.inspectionId, inspectionId),
      eq(scopeItem.confirmed, true),
      eq(scopeItem.deleted, false)
    ));

  return result;
}

/**
 * Get pending (unconfirmed) scope items for an inspection
 */
export async function getPendingScopeItems(inspectionId: string) {
  const result = await db()
    .select()
    .from(scopeItem)
    .where(and(
      eq(scopeItem.inspectionId, inspectionId),
      eq(scopeItem.confirmed, false),
      eq(scopeItem.deleted, false)
    ));

  return result;
}

/**
 * Count confirmed scope items for an inspection
 */
export async function countConfirmedScopeItems(inspectionId: string) {
  const result = await db()
    .select({ count: scopeItem.id })
    .from(scopeItem)
    .where(and(
      eq(scopeItem.inspectionId, inspectionId),
      eq(scopeItem.confirmed, true),
      eq(scopeItem.deleted, false)
    ));

  return result.length;
}

/**
 * Check if all scope items are reviewed (confirmed or deleted)
 */
export async function areAllScopeItemsReviewed(inspectionId: string) {
  const items = await getInspectionScopeItems(inspectionId);
  return items.every(item => item.confirmed || item.deleted);
}
