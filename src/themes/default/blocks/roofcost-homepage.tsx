"use client";

import dynamic from 'next/dynamic';

// Critical component loaded normally
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

const CTABand = dynamic(() => import('./homepage/cta-band').then(mod => mod.CTABand), {
  ssr: true,
});

// Main Homepage Component
export function RoofcostHomepage({
  section,
  isCustomHomepage,
}: {
  section?: any;
  isCustomHomepage?: boolean;
}) {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <Materials />
      <SocialProof />
      <CTABand />
    </>
  );
}
