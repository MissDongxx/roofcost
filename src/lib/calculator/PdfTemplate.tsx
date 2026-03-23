import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link, Svg, Rect, Path, G } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottom: '2px solid #C0392B',
    paddingBottom: 10,
  },
  logo: {
    width: 100,
    height: 'auto',
  },
  title: { fontSize: 24, textAlign: 'right', fontWeight: 'bold', color: '#1B3A5C' },
  date: { fontSize: 10, color: 'gray', textAlign: 'right', marginTop: 5 },
  section: { margin: 10, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: 5, paddingTop: 5 },
  label: { fontSize: 12 },
  value: { fontSize: 12, fontWeight: 'bold' },
  highlight: { backgroundColor: '#EBF1F7', padding: 20, marginTop: 10, borderRadius: 8, border: '1px solid #1B3A5C' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTop: '1px solid #eee',
  },
  link: {
    fontSize: 10,
    color: '#C0392B',
    textDecoration: 'none',
  },
});

const Logo = () => (
  <Svg width="40" height="40" viewBox="0 0 36 36">
    <Rect width="36" height="36" rx="8" fill="#1B3A5C"/>
    <Path d="M6 20 L18 8 L30 20" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <Rect x="10" y="20" width="16" height="10" rx="1" fill="#FFFFFF" opacity={0.15}/>
    <Text x="14" y="28" style={{ fontFamily: 'Helvetica', fontSize: 12, fill: 'white', fontStyle: 'italic' }}>$</Text>
  </Svg>
);

export const RoofEstimatePDF = ({ 
  result, 
  input, 
  logoUrl, 
  appUrl,
  appName 
}: { 
  result: any, 
  input: any, 
  logoUrl?: string, 
  appUrl?: string,
  appName?: string
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Link src={appUrl || '#'}>
          <Logo />
        </Link>
        <View>
          <Text style={styles.title}>Roof Estimate</Text>
          <Text style={styles.date}>Generated on {new Date().toLocaleDateString()}</Text>
        </View>
      </View>
 
      <View style={styles.highlight}>
        <Text style={{ fontSize: 14, marginBottom: 8, color: '#1B3A5C' }}>Estimated Cost Range:</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#C0392B' }}>
          ${result.low.toLocaleString()} - ${result.high.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 12, marginTop: 8, color: '#1B3A5C' }}>Average Expected: ${result.mid.toLocaleString()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1C1C1E' }}>Property Details</Text>
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
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1C1C1E' }}>Cost Breakdown</Text>
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

      <View style={styles.footer}>
        <Link src={appUrl || '#'} style={styles.link}>
          Visit {appName || 'our website'} for more details
        </Link>
      </View>
      
    </Page>
  </Document>
);
