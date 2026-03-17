import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface OverviewSectionProps {
  roofCondition: {
    condition: string;
    summary: string;
  };
  roofType: string;
  totalObservations: number;
  totalScopeItems: number;
}

export default function OverviewSection({
  roofCondition,
  roofType,
  totalObservations,
  totalScopeItems,
}: OverviewSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Overview</Text>
      <Text style={styles.subheader}>Inspection Summary</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roof Condition Assessment</Text>
        <View style={styles.conditionBox}>
          <Text style={[styles.conditionText, (styles as any)[`condition${roofCondition.condition}`]]}>
            {roofCondition.condition.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.summary}>{roofCondition.summary}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{roofType}</Text>
          <Text style={styles.statLabel}>Roof Type</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalObservations}</Text>
          <Text style={styles.statLabel}>Observations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalScopeItems}</Text>
          <Text style={styles.statLabel}>Scope Items</Text>
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.noteTitle}>Inspection Notes</Text>
        <Text style={styles.noteText}>
          This report is based on a visual inspection conducted from ground level
          and accessible areas. findings should be verified by a qualified roofing
          professional before proceeding with any repairs or replacements.
        </Text>
      </View>
    </View>
  );
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 15,
  },
  conditionBox: {
    backgroundColor: '#F1F5F9',
    padding: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  conditionText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  conditionExcellent: {
    color: '#10B981',
  },
  conditionGood: {
    color: '#22C55E',
  },
  conditionFair: {
    color: '#F59E0B',
  },
  conditionPoor: {
    color: '#EF4444',
  },
  conditionCritical: {
    color: '#DC2626',
  },
  summary: {
    fontSize: 12,
    lineHeight: 1.6,
    color: '#475569',
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 8,
    marginRight: 15,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noteSection: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#78350F',
  },
});
