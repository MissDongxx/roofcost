import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface ScopeItem {
  id: string;
  xactimateCode: string | null;
  lineItem: string | null;
  description: string | null;
}

interface ScopeSectionProps {
  scopeItems: ScopeItem[];
}

export default function ScopeSection({ scopeItems }: ScopeSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Scope of Work</Text>
      <Text style={styles.subheader}>Recommended Repairs and Services</Text>

      {scopeItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No confirmed scope items. Please review observations and confirm items.
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellCode]}>Code</Text>
            <Text style={[styles.headerCell, styles.cellItem]}>Line Item</Text>
            <Text style={[styles.headerCell, styles.cellDesc]}>Description</Text>
          </View>

          {scopeItems.map((item, index) => (
            <View key={item.id} style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
              <Text style={[styles.cell, styles.cellCode]}>
                {item.xactimateCode || '—'}
              </Text>
              <Text style={[styles.cell, styles.cellItem]}>
                {item.lineItem || '—'}
              </Text>
              <Text style={[styles.cell, styles.cellDesc]}>
                {item.description || 'No description available'}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total: {scopeItems.length} scope item{scopeItems.length !== 1 ? 's' : ''} identified
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
  tableContainer: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 12,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cellCode: {
    width: '15%',
  },
  cellItem: {
    width: '30%',
  },
  cellDesc: {
    width: '55%',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  rowEven: {
    backgroundColor: '#FFFFFF',
  },
  rowOdd: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    fontSize: 10,
    color: '#334155',
  },
  emptyState: {
    backgroundColor: '#F1F5F9',
    padding: 40,
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748B',
  },
  footer: {
    backgroundColor: '#DBEAFE',
    padding: 15,
    borderRadius: 4,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
});
