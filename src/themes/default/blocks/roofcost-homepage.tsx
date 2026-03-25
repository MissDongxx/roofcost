import dynamic from 'next/dynamic';
import { BlogSection } from './homepage/blog-section';
import { HeroSection } from './homepage/hero-section';

// Non-critical components loaded dynamically to reduce initial JS bundle
const StatsBar = dynamic(() => import('./homepage/stats-bar').then(mod => mod.StatsBar), {
  ssr: true,
});

const HowItWorks = dynamic(() => import('./homepage/how-it-works').then(mod => mod.HowItWorks), {
  ssr: true,
});

const Materials = dynamic(() => import('./homepage/materials-section').then(mod => mod.Materials), {
  ssr: true,
});

const SocialProof = dynamic(() => import('./homepage/social-proof').then(mod => mod.SocialProof), {
  ssr: true,
});

const FAQSection = dynamic(() => import('./homepage/faq-section').then(mod => mod.FAQSection), {
  ssr: true,
});

const CTABand = dynamic(() => import('./homepage/cta-band').then(mod => mod.CTABand), {
  ssr: true,
});

const Logos = dynamic<{ section: any; className?: string }>(() => import('./logos').then(mod => mod.Logos), {
  ssr: true,
});

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
    title: "",
    className: "bg-[var(--ink)] text-white/50 border-t border-white/5 py-10 md:py-16",
    items: [
      {
        image: {
          src: "https://www.toolpilot.ai/cdn/shop/files/tp-b-h_bec97d1a-5538-498b-8a26-77de74f90ed5_1692x468_crop_center.svg?v=1695882612",
          alt: "ToolPilot"
        },
        link: "https://www.toolpilot.ai"
      }
    ]
  };

  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <Materials />
      <SocialProof />
      <BlogSection locale={locale} />
      <FAQSection />
      <CTABand />
      <Logos section={partnerLogos as any} />
    </>
  );
}
