import { BlogSection } from './homepage/blog-section';
import { CTABand } from './homepage/cta-band';
import { FAQSection } from './homepage/faq-section';
import { HeroSection } from './homepage/hero-section';
import { HowItWorks } from './homepage/how-it-works';
import { Materials } from './homepage/materials-section';
import { SocialProof } from './homepage/social-proof';
import { StatsBar } from './homepage/stats-bar';
import { Logos } from './logos';

// Main Homepage Component - Now a Server Component
export function RoofcostHomepage({
  section,
  isCustomHomepage,
  locale = 'en',
}: {
  section?: any;
  isCustomHomepage?: boolean;
  locale?: string;
}) {
  const partnerLogos = {
    title: '',
    className:
      'bg-[var(--ink)] text-white/50 border-t border-white/5 py-10 md:py-16',
    items: [
      {
        image: {
          src: 'https://www.toolpilot.ai/cdn/shop/files/tp-b-h_bec97d1a-5538-498b-8a26-77de74f90ed5_1692x468_crop_center.svg?v=1695882612',
          alt: 'ToolPilot',
        },
        link: 'https://www.toolpilot.ai',
      },
    ],
  };

  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <Materials />
      <SocialProof />
      <BlogSection />
      <FAQSection />
      <CTABand />
      <Logos section={partnerLogos as any} />
    </>
  );
}
