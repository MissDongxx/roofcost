import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', fontWeight: 'bold' },
  date: { fontSize: 10, color: 'gray', marginBottom: 20, textAlign: 'right' },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 5, paddingTop: 5 },
  label: { fontSize: 12 },
  value: { fontSize: 12, fontWeight: 'bold' },
  highlight: { backgroundColor: '#f0fdf4', padding: 20, marginTop: 10, borderRadius: 8, border: '1px solid #bbf7d0' },
});

export const RoofEstimatePDF = ({ result, input }: { result: any, input: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.date}>Generated on {new Date().toLocaleDateString()}</Text>
      <Text style={styles.title}>Roof Replacement Estimate</Text>

      <View style={styles.highlight}>
        <Text style={{ fontSize: 14, marginBottom: 8, color: '#166534' }}>Estimated Cost Range:</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#15803d' }}>
          ${result.low.toLocaleString()} - ${result.high.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 12, marginTop: 8, color: '#166534' }}>Average Expected: ${result.mid.toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>Property Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ZIP Code</Text>
          <Text style={styles.value}>{input.zipCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Roof Material</Text>
          <Text style={styles.value}>{result.materialName}</Text>
        </View>
      </View>

      <View style={{ ...styles.section, marginTop: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' }}>Cost Breakdown</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Base Materials</Text>
          <Text style={styles.value}>${result.breakdown.materialCost.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Installation Labor</Text>
          <Text style={styles.value}>${result.breakdown.laborCost.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tear-off Old Roof</Text>
          <Text style={styles.value}>${result.breakdown.tearoffCost.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Disposal & Dumpster</Text>
          <Text style={styles.value}>${result.breakdown.disposalCost.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Permits & Fees</Text>
          <Text style={styles.value}>${result.breakdown.permitCost.toLocaleString()}</Text>
        </View>
      </View>
      
    </Page>
  </Document>
);
