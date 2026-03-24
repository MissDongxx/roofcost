import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

export function ContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>New Contact Form Submission from {name}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.card}>
            <Section style={styles.accentBar} />
            <Heading style={styles.h1}>New Contact Form Submission</Heading>

            <Section style={styles.section}>
              <Heading as="h2" style={styles.h2}>Contact Information</Heading>
              <Section style={styles.row}>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{name}</Text>
              </Section>
              <Section style={styles.row}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>
                  <a href={`mailto:${email}`} style={styles.link}>
                    {email}
                  </a>
                </Text>
              </Section>
            </Section>

            <Section style={styles.section}>
              <Heading as="h2" style={styles.h2}>Message</Heading>
              <Text style={styles.message}>{message}</Text>
            </Section>

            <Hr style={styles.hr} />

            <Section style={styles.footer}>
              <Text style={styles.footerMuted}>
                Sent on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
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
    maxWidth: '600px',
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
  section: {
    marginBottom: 24,
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
  message: {
    margin: 0,
    fontSize: 14,
    lineHeight: '24px',
    color: '#1C1C1E',
    whiteSpace: 'pre-wrap',
  },
  link: {
    color: '#C0392B',
    textDecoration: 'none',
  },
  hr: {
    borderColor: '#f1f5f9',
    margin: '24px 0',
  },
  footer: {
    textAlign: 'center',
  },
  footerMuted: {
    margin: 0,
    fontSize: 12,
    color: '#94a3b8',
  },
};
