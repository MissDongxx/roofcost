import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '@/core/db';
import { report } from '@/config/db/schema';

export type Report = typeof report.$inferSelect;
export type NewReport = typeof report.$inferInsert;

/**
 * Create a new report record
 */
export async function createReport(
  newReport: Omit<NewReport, 'id' | 'generatedAt' | 'shareToken'>
) {
  const id = nanoid();
  const shareToken = nanoid(16); // 16-char token for sharing
  const [result] = await db()
    .insert(report)
    .values({
      id,
      shareToken,
      ...newReport,
    })
    .returning();

  return result;
}

/**
 * Find report by ID
 */
export async function findReportById(id: string) {
  const [result] = await db()
    .select()
    .from(report)
    .where(eq(report.id, id));

  return result;
}

/**
 * Find report by share token
 */
export async function findReportByShareToken(shareToken: string) {
  const [result] = await db()
    .select()
    .from(report)
    .where(
      and(
        eq(report.shareToken, shareToken),
        // Check if not expired (shareExpiresAt is null or in the future)
        // For simplicity, we'll check expiration in the application layer
      )
    );

  return result;
}

/**
 * Get report by inspection ID
 */
export async function findReportByInspectionId(inspectionId: string) {
  const [result] = await db()
    .select()
    .from(report)
    .where(eq(report.inspectionId, inspectionId));

  return result;
}

/**
 * Update report
 */
export async function updateReport(
  id: string,
  updatedReport: Partial<Omit<NewReport, 'id' | 'generatedAt'>>
) {
  const [result] = await db()
    .update(report)
    .set(updatedReport)
    .where(eq(report.id, id))
    .returning();

  return result;
}

/**
 * Generate a new share token for a report
 */
export async function regenerateShareToken(
  id: string,
  expiresAt?: Date
) {
  const newToken = nanoid(16);
  const [result] = await db()
    .update(report)
    .set({
      shareToken: newToken,
      shareExpiresAt: expiresAt || null,
    })
    .where(eq(report.id, id))
    .returning();

  return result;
}

/**
 * Check if a share token is valid (not expired)
 */
export async function isShareTokenValid(shareToken: string): Promise<boolean> {
  const reportRecord = await findReportByShareToken(shareToken);
  if (!reportRecord) return false;

  // Check expiration
  if (reportRecord.shareExpiresAt) {
    return reportRecord.shareExpiresAt > new Date();
  }

  return true;
}
