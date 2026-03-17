import {
  Document,
  Page,
  StyleSheet,
  View,
  Text,
  Font,
} from '@react-pdf/renderer';
import CoverPage from './CoverPage';
import OverviewSection from './OverviewSection';
import PhotosSection from './PhotosSection';
import ScopeSection from './ScopeSection';
import ObservationsSection from './ObservationsSection';
import AppendixSection from './AppendixSection';

import type { ReportData } from '@/types/pdf';
import { calculateRoofCondition, groupObservationsByComponent, formatPDFDate } from '@/lib/pdf-generator';

interface ReportTemplateProps {
  data: ReportData;
}

export default function ReportTemplate({ data }: ReportTemplateProps) {
  const roofCondition = calculateRoofCondition(data.observations);
  const groupedObservations = groupObservationsByComponent(data.observations);

  return (
    <Document>
      {/* Cover Page */}
      <Page size="LETTER" style={styles.page}>
        <CoverPage
          address={data.inspection.address}
          roofType={data.inspection.roofType}
          inspectionDate={formatPDFDate(data.inspection.createdAt)}
          roofCondition={roofCondition.condition}
        />
      </Page>

      {/* Overview Section */}
      <Page size="LETTER" style={styles.page}>
        <OverviewSection
          roofCondition={roofCondition}
          roofType={data.inspection.roofType}
          totalObservations={data.observations.length}
          totalScopeItems={data.scopeItems.length}
        />
      </Page>

      {/* Photos Section - May span multiple pages */}
      <Page size="LETTER" style={styles.page}>
        <PhotosSection photos={data.photos} />
      </Page>

      {/* Scope of Work Section */}
      <Page size="LETTER" style={styles.page}>
        <ScopeSection scopeItems={data.scopeItems} />
      </Page>

      {/* Observations Section - May span multiple pages */}
      <Page size="LETTER" style={styles.page}>
        <ObservationsSection
          groupedObservations={groupedObservations}
        />
      </Page>

      {/* Appendix Section */}
      <Page size="LETTER" style={styles.page}>
        <AppendixSection />
      </Page>
    </Document>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
  },
});
