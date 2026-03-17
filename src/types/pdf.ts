export interface ReportData {
  inspection: {
    id: string;
    address: string;
    roofType: string;
    status: string;
    createdAt: Date | string;
  };
  photos: Array<{
    id: string;
    photoType: string;
    storageUrl: string;
    processedUrl: string | null;
    annotatedUrl: string | null;
    gps: string | null;
    uploadedAt: Date | string;
  }>;
  observations: Array<{
    id: string;
    photoId: string;
    component: string | null;
    damage: string | null;
    severity: string | null;
    location: string | null;
    rawDescription: string | null;
    confidence: string | null;
  }>;
  scopeItems: Array<{
    id: string;
    xactimateCode: string | null;
    lineItem: string | null;
    description: string | null;
  }>;
}

export interface RoofCondition {
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  summary: string;
}

export interface PhotoGroup {
  type: string;
  photos: Array<{
    url: string;
    type: string;
  }>;
}
