import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface Observation {
  id: string;
  photoId: string;
  component: string | null;
  damage: string | null;
  severity: string | null;
  location: string | null;
  rawDescription: string | null;
  confidence: string | null;
}

interface ObservationsSectionProps {
  groupedObservations: Record<string, Observation[]>;
}

export default function ObservationsSection({ groupedObservations }: ObservationsSectionProps) {
  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'Critical':
        return '#DC2626';
      case 'Severe':
        return '#EF4444';
      case 'Moderate':
        return '#F59E0B';
      case 'Minor':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detailed Observations</Text>
      <Text style={styles.subheader}>Findings by Component</Text>

      {Object.keys(groupedObservations).length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No observations recorded during this inspection.
          </Text>
        </View>
      ) : (
        Object.entries(groupedObservations).map(([component, observations]) => (
          <View key={component} style={styles.componentSection} break={observations.length > 4}>
            <View style={styles.componentHeader}>
              <Text style={styles.componentTitle}>
                {formatComponentName(component)}
              </Text>
              <View style={styles.componentBadge}>
                <Text style={styles.componentBadgeText}>
                  {observations.length}
                </Text>
              </View>
            </View>

            {observations.map((obs) => (
              <View key={obs.id} style={styles.observationCard}>
                <View style={styles.observationHeader}>
                  {obs.damage && (
                    <Text style={styles.observationTitle}>
                      {obs.damage}
                    </Text>
                  )}
                  {obs.severity && (
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(obs.severity) }]}>
                      <Text style={styles.severityText}>
                        {obs.severity.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>

                {obs.location && (
                  <Text style={styles.observationLocation}>
                    Location: {obs.location}
                  </Text>
                )}

                {obs.rawDescription && (
                  <Text style={styles.observationDescription}>
                    {obs.rawDescription}
                  </Text>
                )}

                {obs.confidence && (
                  <Text style={styles.observationConfidence}>
                    Confidence: {obs.confidence}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

function formatComponentName(component: string): string {
  const names: Record<string, string> = {
    shingles: 'Shingles',
    flashing: 'Flashing',
    gutters: 'Gutters',
    downspouts: 'Downspouts',
    chimney: 'Chimney',
    valleys: 'Valleys',
    ventilation: 'Ventilation',
    skylights: 'Skylights',
    fascia: 'Fascia',
    soffit: 'Soffit',
    other: 'Other',
  };
  return names[component] || component.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

const styles = StyleSheet.create({
  container: {
    padding: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  subheader: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 40,
  },
  emptyState: {
    backgroundColor: '#F1F5F9',
    padding: 40,
    borderRadius: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  componentSection: {
    marginBottom: 30,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  componentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  componentBadge: {
    backgroundColor: '#3B82F6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  componentBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  observationCard: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  observationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  observationTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  severityBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  observationLocation: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 6,
  },
  observationDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
    marginBottom: 6,
  },
  observationConfidence: {
    fontSize: 9,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
