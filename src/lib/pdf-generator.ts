import { renderToBuffer } from '@react-pdf/renderer';
import ReportTemplate from '@/components/pdf/ReportTemplate';

import type { ReportData } from '@/types/pdf';
import type { Inspection } from '@/shared/models/inspection';
import type { Photo } from '@/shared/models/photo';
import type { Observation as ModelObservation } from '@/shared/models/observation';
import type { ScopeItem } from '@/shared/models/scope_item';

// Type alias for the observation type used in ReportData
type ReportObservation = ReportData['observations'][0];

/**
 * Gather all data needed for the PDF report
 */
export async function gatherReportData(
  inspection: Inspection,
  photos: Photo[],
  observations: ModelObservation[],
  scopeItems: ScopeItem[]
): Promise<ReportData> {
  return {
    inspection: {
      id: inspection.id,
      address: inspection.address,
      roofType: inspection.roofType || 'Unknown',
      status: inspection.status,
      createdAt: inspection.createdAt,
    },
    photos: photos.map(photo => ({
      id: photo.id,
      photoType: photo.photoType,
      storageUrl: photo.storageUrl,
      processedUrl: photo.processedUrl,
      annotatedUrl: photo.annotatedUrl,
      gps: photo.gps,
      uploadedAt: photo.uploadedAt,
    })),
    observations: observations.map(obs => ({
      id: obs.id,
      photoId: obs.photoId,
      component: obs.component,
      damage: obs.damage,
      severity: obs.severity,
      location: obs.location,
      rawDescription: obs.rawDescription,
      confidence: obs.confidence,
    })),
    scopeItems: scopeItems
      .filter(item => item.confirmed && !item.deleted)
      .map(item => ({
        id: item.id,
        xactimateCode: item.xactimateCode,
        lineItem: item.lineItem,
        description: item.description,
      })),
  };
}

/**
 * Generate PDF buffer from report data
 */
export async function generatePDFBuffer(data: ReportData): Promise<Buffer> {
  const buffer = await renderToBuffer(ReportTemplate({ data }));
  return buffer as Buffer;
}

/**
 * Generate filename for the report
 */
export function generateReportFilename(inspection: Inspection): string {
  const date = new Date(inspection.createdAt).toISOString().split('T')[0];
  const address = inspection.address.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  return `roof_inspection_${address}_${date}.pdf`;
}

/**
 * Calculate overall roof condition based on observations
 */
export function calculateRoofCondition(observations: ReportObservation[]): {
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  summary: string;
} {
  if (observations.length === 0) {
    return {
      condition: 'Good',
      summary: 'No significant issues detected during inspection.',
    };
  }

  const severityCounts = observations.reduce(
    (acc, obs) => {
      const severity = obs.severity || 'Unknown';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const criticalCount = severityCounts['Critical'] || 0;
  const severeCount = severityCounts['Severe'] || 0;
  const moderateCount = severityCounts['Moderate'] || 0;

  if (criticalCount > 0 || severeCount > 2) {
    return {
      condition: 'Critical',
      summary: `Multiple severe damage areas identified requiring immediate attention. ${criticalCount} critical and ${severeCount} severe issues found.`,
    };
  }

  if (severeCount > 0 || moderateCount > 3) {
    return {
      condition: 'Poor',
      summary: `Significant damage detected that should be addressed soon. ${severeCount} severe and ${moderateCount} moderate issues found.`,
    };
  }

  if (moderateCount > 0) {
    return {
      condition: 'Fair',
      summary: `Some wear and minor damage noted. ${moderateCount} moderate issues identified for monitoring and potential repair.`,
    };
  }

  return {
    condition: 'Good',
    summary: 'Roof is in generally good condition with minimal wear detected.',
  };
}

/**
 * Group observations by component for the report
 */
export function groupObservationsByComponent(observations: ReportObservation[]): Record<string, ReportObservation[]> {
  return observations.reduce(
    (acc, obs) => {
      const component = obs.component || 'Other';
      if (!acc[component]) {
        acc[component] = [];
      }
      acc[component].push(obs);
      return acc;
    },
    {} as Record<string, ReportObservation[]>
  );
}

/**
 * Format date for display in PDF
 */
export function formatPDFDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get photo type display name
 */
export function getPhotoTypeName(photoType: string): string {
  const names: Record<string, string> = {
    overview: 'Property Overview',
    north_side: 'North Side',
    south_side: 'South Side',
    east_side: 'East Side',
    west_side: 'West Side',
    flashing: 'Flashing Details',
    valley: 'Valley Areas',
    chimney: 'Chimney/ penetrations',
    gutters: 'Gutters & Downspouts',
    ventilation: 'Ventilation',
    close_up_damage: 'Close-up: Damage',
    close_up_material: 'Close-up: Material',
    miscellaneous: 'Additional Photos',
  };
  return names[photoType] || photoType;
}
