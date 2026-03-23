"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/core/i18n/navigation';

// Hero Section Component
function HeroSection() {
  const router = useRouter();
  const [zip, setZip] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      router.push(`/calculator?zip=${zip}`);
    } else {
      setError('Please enter a valid 5-digit ZIP code');
    }
  };

  const popularCities = [
    { name: 'Houston', href: '/roof-cost/texas/houston' },
    { name: 'Los Angeles', href: '/roof-cost/california/los-angeles' },
    { name: 'Miami', href: '/roof-cost/florida/miami' },
    { name: 'Chicago', href: '/roof-cost/illinois/chicago' },
    { name: 'Phoenix', href: '/roof-cost/arizona/phoenix' },
    { name: 'Atlanta', href: '/roof-cost/georgia/atlanta' },
  ];

  return (
    <section style={{ background: 'var(--cream)' }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-12 md:py-24 grid md:grid-cols-[1fr_480px] gap-0 items-center min-h-[calc(100vh-var(--nav-height))]">
        {/* Left side - Hero content */}
        <div className="md:pr-12">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-medium text-[var(--rust)] uppercase tracking-[0.1em] mb-5">
            <span className="block w-6 h-0.5 bg-[var(--rust)]" style={{ animation: 'slideRight 0.6s cubic-bezier(.22,1,.36,1) 0.2s both', transformOrigin: 'left' }}></span>
            Free · No Signup · Instant Results
          </div>

          <h1 className="font-serif text-[clamp(38px,5vw,60px)] leading-[1.1] text-[var(--ink)] tracking-tight mb-5">
            Know your roof cost<br />
            <em className="text-[var(--rust)] italic">before</em> the contractor does.
          </h1>

          <p className="text-[17px] text-[var(--ink-3)] leading-[1.7] max-w-[460px] mb-9">
            Enter your ZIP and get a math-based estimate in seconds—
            localized to your city, transparent to the last dollar.
            No sales calls, no email required.
          </p>

          <form onSubmit={handleSubmit} className="bg-white border-[1.5px] border-[var(--cream-3)] rounded-[var(--radius-lg)] p-1.5 pl-5 flex items-center gap-2 max-w-[420px] shadow-sm transition-all focus-within:border-[var(--rust)] focus-within:shadow-[0_0_0_3px_rgba(192,57,43,.12)]">
            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter ZIP code"
              value={zip}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, '').slice(0, 5);
                setZip(numericValue);
                setError('');
              }}
              className="flex-1 border-none outline-none bg-transparent font-mono text-xl font-medium text-[var(--ink)] tracking-[0.08em]"
              maxLength={5}
            />
            <button
              type="submit"
              className="bg-[var(--rust)] text-white font-sans text-sm font-medium px-5 py-3 rounded-lg whitespace-nowrap transition-all hover:bg-[var(--rust-2)] flex items-center gap-1.5"
            >
              Get Estimate
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          {error && (
            <p className="text-[var(--rust)] text-sm mt-2.5">{error}</p>
          )}

          <p className="text-[12px] text-[var(--ink-3)] mt-2.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] shrink-0"></span>
            Free estimate · Takes 90 seconds · No account needed
          </p>

          <div className="mt-7 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-[var(--ink-3)] uppercase tracking-[0.08em] whitespace-nowrap">Popular:</span>
            {popularCities.map((city) => (
              <Link
                key={city.name}
                href={city.href}
                className="text-[12px] text-[var(--slate)] no-underline px-2.5 py-1 bg-[var(--slate-light)] rounded-[20px] transition-all whitespace-nowrap border border-transparent hover:bg-[var(--slate)] hover:text-white"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - Estimate Preview Card */}
        <div className="relative hidden md:block">
          {/* Float badge 1 */}
          <div className="absolute -top-4 -right-4 bg-white rounded-lg p-2.5 px-3.5 shadow-lg text-[12px] font-medium text-[var(--ink)] flex items-center gap-2 z-10 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[var(--green)] shrink-0"></span>
            NYC local data · 142 quotes
          </div>

          <div className="bg-white rounded-[var(--radius-lg)] p-7 shadow-[0_8px_40px_rgba(0,0,0,.1),0_2px_8px_rgba(0,0,0,.06)] relative z-0">
            <div className="flex justify-between items-start mb-5">
              <div>
                <div className="font-mono text-[10px] text-[var(--ink-3)] uppercase tracking-[0.1em]">Estimated cost</div>
                <div className="text-[13px] font-medium text-[var(--slate)] mt-1">10001 — New York City, NY</div>
              </div>
              <div className="bg-[var(--green-light)] text-[var(--green)] text-[11px] font-medium px-2.5 py-1 rounded-[20px] font-mono">
                Architectural
              </div>
            </div>

            <div className="text-center py-6 border-y border-[var(--cream-2)] my-5">
              <div className="font-mono text-[10px] text-[var(--ink-3)] uppercase tracking-[0.1em] mb-2">Estimated cost range</div>
              <div className="font-serif text-[40px] text-[var(--slate)] tracking-tight leading-none">
                $<span className="text-[var(--rust)]">19,400</span> – $39,600
              </div>
              <div className="font-mono text-[12px] text-[var(--ink-3)] mt-1.5">Average: $28,800 · 2,000 sq ft</div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[13px] text-[var(--ink-2)]">Base Materials</div>
                    <div className="text-[11px] text-[var(--ink-3)]">54% of total</div>
                  </div>
                  <div className="font-mono text-[13px] text-[var(--ink)] font-medium">$15,576</div>
                </div>
                <div className="h-0.5 bg-[var(--cream-2)] rounded mt-1 overflow-hidden">
                  <div className="h-full rounded-[2px]" style={{ width: '54%', background: 'var(--slate)' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[13px] text-[var(--ink-2)]">Installation Labor</div>
                    <div className="text-[11px] text-[var(--ink-3)]">30% of total · NYC rate 1.42×</div>
                  </div>
                  <div className="font-mono text-[13px] text-[var(--ink)] font-medium">$8,591</div>
                </div>
                <div className="h-0.5 bg-[var(--cream-2)] rounded mt-1 overflow-hidden">
                  <div className="h-full rounded-[2px]" style={{ width: '30%', background: 'var(--rust)' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[13px] text-[var(--ink-2)]">Tear-off + Disposal</div>
                    <div className="text-[11px] text-[var(--ink-3)]">15%</div>
                  </div>
                  <div className="font-mono text-[13px] text-[var(--ink)] font-medium">$4,369</div>
                </div>
                <div className="h-0.5 bg-[var(--cream-2)] rounded mt-1 overflow-hidden">
                  <div className="h-full rounded-[2px]" style={{ width: '15%', background: 'var(--gold)' }}></div>
                </div>
              </div>
              <div className="border-t border-[var(--cream-2)] pt-2.5 mt-0.5">
                <div className="flex justify-between items-center">
                  <div className="text-[13px] text-[var(--ink-2)] font-semibold">Permits & Fees</div>
                  <div className="font-mono text-[13px] text-[var(--ink)] font-medium">$250</div>
                </div>
              </div>
            </div>
          </div>

          {/* Float badge 2 */}
          <div className="absolute -bottom-4 -left-6 bg-white rounded-lg p-2.5 px-3.5 shadow-lg text-[12px] font-medium text-[var(--ink)] flex items-center gap-2 z-10 whitespace-nowrap">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L8.8 5.2L13.4 5.6L10.1 8.5L11.1 13L7 10.5L2.9 13L3.9 8.5L0.6 5.6L5.2 5.2L7 1Z" fill="#E8A020"/>
            </svg>
            No signup required
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats Bar Component
function StatsBar() {
  return (
    <div className="bg-[var(--slate)] py-7 px-4 md:px-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-0 text-center">
        <div className="py-0 px-6 md:border-r border-white/10 last:border-r-0">
          <div className="font-serif text-[36px] text-white tracking-tight leading-none">
            50<em className="text-[rgba(192,57,43,.9)] italic">+</em>
          </div>
          <div className="font-mono text-[12px] text-white/50 mt-1.5 uppercase tracking-[0.08em]">States covered</div>
        </div>
        <div className="py-0 px-6 md:border-r border-white/10 last:border-r-0">
          <div className="font-serif text-[36px] text-white tracking-tight leading-none">
            200<em className="text-[rgba(192,57,43,.9)] italic">+</em>
          </div>
          <div className="font-mono text-[12px] text-white/50 mt-1.5 uppercase tracking-[0.08em]">Cities with local data</div>
        </div>
        <div className="py-0 px-6 md:border-r border-white/10 last:border-r-0">
          <div className="font-serif text-[36px] text-white tracking-tight leading-none">6</div>
          <div className="font-mono text-[12px] text-white/50 mt-1.5 uppercase tracking-[0.08em]">Roofing materials</div>
        </div>
        <div className="py-0 px-6">
          <div className="font-serif text-[36px] text-white tracking-tight leading-none">
            <em className="text-[rgba(192,57,43,.9)] italic">$0</em>
          </div>
          <div className="font-mono text-[12px] text-white/50 mt-1.5 uppercase tracking-[0.08em]">Cost to use · forever</div>
        </div>
      </div>
    </div>
  );
}

// How It Works Component
function HowItWorks() {
  return (
    <div className="bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-[60px] md:py-[100px]">
        <div className="font-mono text-[11px] text-[var(--rust)] uppercase tracking-[0.12em] mb-3 flex items-center gap-2.5">
          How it works
          <span className="flex-1 max-w-[48px] h-px bg-[var(--rust)]"></span>
        </div>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-[var(--ink)] tracking-tight mb-3">
          Three inputs.<br />
          One honest number.
        </h2>
        <p className="text-[16px] text-[var(--ink-3)] max-w-[520px] leading-[1.7] mb-12">
          Our calculator uses BLS labor data and live material indexes—not guesswork—to give you a localized estimate before you talk to a single contractor.
        </p>

        <div className="grid md:grid-cols-3 gap-px">
          <div className="bg-white p-8 md:pl-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:z-10 hover:shadow-xl first:rounded-l-[var(--radius-lg)] last:rounded-r-[var(--radius-lg)]">
            <div className="font-serif text-[72px] text-[var(--cream-2)] absolute -top-2 right-4 leading-none pointer-events-none transition-colors">
              1
            </div>
            <div className="w-11 h-11 bg-[var(--rust-light)] rounded-lg flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M11 2L20 8V20H14V14H8V20H2V8L11 2Z" stroke="var(--rust)" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <h3 className="font-serif text-[22px] text-[var(--ink)] mb-2.5">Enter your location</h3>
            <p className="text-[14px] text-[var(--ink-3)] leading-[1.7]">
              ZIP code tells us your local labor market. NYC costs 42% more than Houston—your estimate reflects that gap exactly.
            </p>
          </div>
          <div className="bg-white p-8 md:pl-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:z-10 hover:shadow-xl">
            <div className="font-serif text-[72px] text-[var(--cream-2)] absolute -top-2 right-4 leading-none pointer-events-none transition-colors">
              2
            </div>
            <div className="w-11 h-11 bg-[var(--rust-light)] rounded-lg flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--rust)" strokeWidth="1.5" fill="none"/>
                <path d="M7 11h8M7 7h5M7 15h3" stroke="var(--rust)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="font-serif text-[22px] text-[var(--ink)] mb-2.5">Describe your roof</h3>
            <p className="text-[14px] text-[var(--ink-3)] leading-[1.7]">
              Area, pitch, complexity, material. Each variable has a real coefficient—we show you the math, not a black box.
            </p>
          </div>
          <div className="bg-white p-8 md:pl-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:z-10 hover:shadow-xl">
            <div className="font-serif text-[72px] text-[var(--cream-2)] absolute -top-2 right-4 leading-none pointer-events-none transition-colors">
              3
            </div>
            <div className="w-11 h-11 bg-[var(--rust-light)] rounded-lg flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M4 16L8 12L12 14L18 6" stroke="var(--rust)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="18" cy="6" r="2" fill="var(--rust)"/>
              </svg>
            </div>
            <h3 className="font-serif text-[22px] text-[var(--ink)] mb-2.5">Get your range</h3>
            <p className="text-[14px] text-[var(--ink-3)] leading-[1.7]">
              Low / mid / high estimate with a full cost breakdown. Download as PDF or compare with real contractor quotes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Materials Component
function Materials() {
  const materials = [
    { name: 'Asphalt 3-Tab', life: '20-year lifespan', price: '$3.50 – $5.50', fill: '22%', href: '/calculator?material=asphalt_3tab' },
    { name: 'Architectural Shingles', life: '30-year lifespan', price: '$4.50 – $7.50', fill: '35%', popular: true, href: '/calculator?material=asphalt_architectural' },
    { name: 'Metal (Corrugated)', life: '40-year lifespan', price: '$7.00 – $12.00', fill: '52%', href: '/calculator?material=metal_corrugated' },
    { name: 'Metal (Standing Seam)', life: '50-year lifespan', price: '$10.00 – $18.00', fill: '66%', href: '/calculator?material=metal_standing_seam' },
    { name: 'Concrete Tile', life: '50-year lifespan', price: '$9.00 – $18.00', fill: '60%', href: '/calculator?material=tile_concrete' },
    { name: 'Natural Slate', life: '100-year lifespan', price: '$15.00 – $30.00', fill: '90%', href: '/calculator?material=slate' },
  ];

  return (
    <div className="bg-[var(--cream-2)]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-[60px] md:py-[100px]">
        <div className="font-mono text-[11px] text-[var(--rust)] uppercase tracking-[0.12em] mb-3 flex items-center gap-2.5">
          By material
          <span className="flex-1 max-w-[48px] h-px bg-[var(--rust)]"></span>
        </div>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-[var(--ink)] tracking-tight mb-3">
          Pick your material,<br />
          see the real cost.
        </h2>
        <p className="text-[16px] text-[var(--ink-3)] max-w-[520px] leading-[1.7] mb-12">
          Click any material to get a full estimate for your ZIP code.
        </p>

        <div className="grid md:grid-cols-3 gap-3">
          {materials.map((material) => (
            <Link
              key={material.name}
              href={material.href}
              className={`bg-white rounded-lg p-5.5 py-5 flex flex-col gap-2 border-[1.5px] transition-all hover:-translate-y-0.5 hover:shadow-md ${material.popular ? 'border-[var(--rust)]' : 'border-transparent'}`}
            >
              <div className="flex justify-between items-start">
                <div className="font-semibold text-[14px] text-[var(--ink)]">{material.name}</div>
                {material.popular && (
                  <span className="text-[10px] bg-[var(--rust)] text-white px-1.5 py-0.5 rounded-[20px] font-mono whitespace-nowrap">
                    Most popular
                  </span>
                )}
              </div>
              <div className="font-mono text-[10px] text-[var(--ink-3)] uppercase tracking-[0.08em]">{material.life}</div>
              <div className={`font-serif text-[22px] ${material.popular ? 'text-[var(--rust)]' : 'text-[var(--slate)]'}`}>{material.price}</div>
              <div className="text-[11px] text-[var(--ink-3)]">per sq ft installed</div>
              <div className="h-0.5 bg-[var(--cream-2)] rounded mt-2 overflow-hidden">
                <div className="h-full rounded-[2px] bg-[var(--rust)]" style={{ width: material.fill }}></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Social Proof Component
function SocialProof() {
  return (
    <div className="bg-white">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-[60px] md:py-[100px]">
        <div className="font-mono text-[11px] text-[var(--rust)] uppercase tracking-[0.12em] mb-3 flex items-center gap-2.5">
          Why homeowners trust us
          <span className="flex-1 max-w-[48px] h-px bg-[var(--rust)]"></span>
        </div>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-[var(--ink)] tracking-tight mb-3">
          We show the math.<br />
          You keep the leverage.
        </h2>

        <div className="grid md:grid-cols-2 gap-6 items-start mt-12">
          {/* Reviews */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-[#E8A020] text-[14px] tracking-[0.12em] mb-3">★★★★★</div>
              <p className="text-[14px] text-[var(--ink-2)] leading-[1.7] italic mb-4">
                "Finally a calculator that doesn&apos;t ask for my phone number just to see an estimate. Got a number, then used it to negotiate my contractor down $3,200."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--slate)] text-white font-serif text-[15px] flex items-center justify-center">
                  MK
                </div>
                <div>
                  <div className="font-medium text-[13px]">Mike K.</div>
                  <div className="font-mono text-[11px] text-[var(--ink-3)]">Houston, TX · Architectural shingles</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-[#E8A020] text-[14px] tracking-[0.12em] mb-3">★★★★★</div>
              <p className="text-[14px] text-[var(--ink-2)] leading-[1.7] italic mb-4">
                "Three contractors quoted me $28k–$34k. This tool said $26k–$39k for my area. I went back and negotiated to $25.5k. Worth every second."
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[var(--rust)] text-white font-serif text-[15px] flex items-center justify-center">
                  SR
                </div>
                <div>
                  <div className="font-medium text-[13px]">Sarah R.</div>
                  <div className="font-mono text-[11px] text-[var(--ink-3)]">Phoenix, AZ · Metal standing seam</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4">
            <div className="bg-[var(--slate)] rounded-lg p-5 px-6 flex items-center gap-4">
              <div className="font-serif text-[36px] text-white leading-none shrink-0">
                142<em className="text-[rgba(192,57,43,.9)] italic">K</em>
              </div>
              <div className="text-[13px] text-white/65 leading-[1.5]">
                estimates generated for homeowners across the US in the past 12 months
              </div>
            </div>
            <div className="bg-[var(--slate)] rounded-lg p-5 px-6 flex items-center gap-4">
              <div className="font-serif text-[36px] text-white leading-none shrink-0">
                <em className="text-[rgba(192,57,43,.9)] italic">±</em>12<em className="text-[rgba(192,57,43,.9)] italic">%</em>
              </div>
              <div className="text-[13px] text-white/65 leading-[1.5]">
                typical accuracy vs. real contractor quotes when local data is available
              </div>
            </div>
            <div className="bg-[var(--rust)] rounded-lg p-5 px-6 flex items-center gap-4">
              <div className="font-serif text-[28px] text-white leading-none shrink-0">$0</div>
              <div className="text-[13px] text-white/80 leading-[1.5]">
                no hidden fees, no upsells, no data sold. We earn through optional contractor referrals only.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CTA Band Component
function CTABand() {
  const router = useRouter();
  const [zip, setZip] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      router.push(`/calculator?zip=${zip}`);
    }
  };

  return (
    <div className="bg-[var(--rust)] py-16 px-4 md:px-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,.03) 20px, rgba(255,255,255,.03) 40px)'
      }}></div>
      <div className="relative z-10 max-w-[1200px] mx-auto">
        <h2 className="font-serif text-[clamp(28px,4vw,44px)] text-white mb-3">Ready to know your number?</h2>
        <p className="text-white/75 text-[16px] mb-8">Takes 90 seconds. No email. No sales calls. Just your estimate.</p>
        <form onSubmit={handleSubmit} className="inline-flex items-center gap-2 bg-white rounded-lg p-1.5 pl-5 max-w-[360px] w-full mx-auto relative">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Your ZIP code"
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="flex-1 border-none outline-none bg-transparent font-mono text-lg font-medium text-[var(--ink)] tracking-[0.08em]"
            maxLength={5}
          />
          <button
            type="submit"
            className="bg-[var(--slate)] text-white font-sans text-sm font-medium px-5 py-2.5 rounded-lg transition-colors hover:bg-[var(--slate-2)]"
          >
            Calculate →
          </button>
        </form>
      </div>
    </div>
  );
}



// Main Homepage Component
export function RoofcostHomepage({
  section,
}: {
  section?: any;
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
