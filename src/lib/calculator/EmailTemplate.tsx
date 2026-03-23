import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export function EstimateEmail({
  appName = 'RoofCost',
  logoUrl,
  logoBase64,
  appUrl,
  result,
  input,
  title = 'Your Roof Replacement Estimate',
}: {
  appName?: string;
  logoUrl?: string;
  logoBase64?: string;
  appUrl?: string;
  result: any;
  input: any;
  title?: string;
}) {
  const finalLogoUrl = logoBase64 ? `data:image/png;base64,${logoBase64}` : logoUrl;
  
  return (
    <Html>
      <Head />
      <Preview>{`${title} for ${input.zipCode}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Section style={styles.accentBar} />
            {(finalLogoUrl || appName) && (
              <Section style={styles.brandRow}>
                {finalLogoUrl ? (
                  <Img
                    src={finalLogoUrl}
                    width="100"
                    height="auto"
                    alt={appName}
                    style={styles.cardLogo}
                  />
                ) : (
                  <Text style={styles.cardBrand}>{appName}</Text>
                )}
              </Section>
            )}
            <Heading style={styles.h1}>{title}</Heading>
            
            <Section style={styles.highlight}>
              <Text style={styles.highlightLabel}>Estimated Cost Range:</Text>
              <Text style={styles.highlightValue}>
                ${result.low.toLocaleString()} - ${result.high.toLocaleString()}
              </Text>
              <Text style={styles.highlightMuted}>
                Average Expected: ${result.mid.toLocaleString()}
              </Text>
            </Section>

            <Section style={styles.section}>
              <Heading as="h2" style={styles.h2}>Property Details</Heading>
              <Section style={styles.row}>
                <Text style={styles.label}>ZIP Code</Text>
                <Text style={styles.value}>{input.zipCode}</Text>
              </Section>
              <Section style={styles.row}>
                <Text style={styles.label}>Roof Material</Text>
                <Text style={styles.value}>{result.materialName}</Text>
              </Section>
            </Section>

            <Section style={styles.section}>
              <Heading as="h2" style={styles.h2}>Cost Breakdown</Heading>
              <Section style={styles.row}>
                <Text style={styles.label}>Base Materials</Text>
                <Text style={styles.value}>${result.breakdown.materialCost.toLocaleString()}</Text>
              </Section>
              <Section style={styles.row}>
                <Text style={styles.label}>Installation Labor</Text>
                <Text style={styles.value}>${result.breakdown.laborCost.toLocaleString()}</Text>
              </Section>
              <Section style={styles.row}>
                <Text style={styles.label}>Tear-off Old Roof</Text>
                <Text style={styles.value}>${result.breakdown.tearoffCost.toLocaleString()}</Text>
              </Section>
              <Section style={styles.row}>
                <Text style={styles.label}>Disposal & Dumpster</Text>
                <Text style={styles.value}>${result.breakdown.disposalCost.toLocaleString()}</Text>
              </Section>
              <Section style={styles.row}>
                <Text style={styles.label}>Permits & Fees</Text>
                <Text style={styles.value}>${result.breakdown.permitCost.toLocaleString()}</Text>
              </Section>
            </Section>

            <Hr style={styles.hr} />

            <Section style={styles.footer}>
              <Link href={appUrl || '#'} style={styles.link}>
                Visit {appName} for more details
              </Link>
              <Text style={styles.footerMuted}>
                Generated on {new Date().toLocaleDateString()}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Helvetica,Arial,sans-serif',
    color: '#0f172a',
  },
  container: {
    maxWidth: 600,
    margin: '0 auto',
    padding: '32px 16px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: '32px',
    border: '1px solid rgba(15, 23, 42, 0.08)',
  },
  accentBar: {
    height: 6,
    borderRadius: 999,
    marginBottom: 24,
    backgroundColor: '#C0392B',
  },
  brandRow: {
    marginBottom: 24,
  },
  cardLogo: {
    display: 'block',
  },
  cardBrand: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1B3A5C',
  },
  h1: {
    margin: '0 0 24px',
    fontSize: 24,
    lineHeight: '32px',
    fontWeight: 700,
    color: '#1C1C1E',
  },
  h2: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 600,
    color: '#1C1C1E',
  },
  highlight: {
    backgroundColor: '#EBF1F7',
    padding: '24px',
    borderRadius: 12,
    border: '1px solid #1B3A5C',
    marginBottom: 32,
  },
  highlightLabel: {
    margin: '0 0 8px',
    fontSize: 14,
    color: '#1B3A5C',
  },
  highlightValue: {
    margin: '0 0 8px',
    fontSize: 28,
    lineHeight: '36px',
    fontWeight: 700,
    color: '#C0392B',
  },
  highlightMuted: {
    margin: 0,
    fontSize: 14,
    color: '#1B3A5C',
  },
  section: {
    marginBottom: 32,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  label: {
    margin: 0,
    fontSize: 14,
    color: '#64748b',
  },
  value: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    color: '#1C1C1E',
  },
  hr: {
    borderColor: '#f1f5f9',
    margin: '32px 0 24px',
  },
  footer: {
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    color: '#C0392B',
    textDecoration: 'none',
    fontWeight: 600,
  },
  footerMuted: {
    margin: '8px 0 0',
    fontSize: 12,
    color: '#94a3b8',
  },
};
