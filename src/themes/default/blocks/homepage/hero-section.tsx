"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/core/i18n/navigation';

export function HeroSection() {
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
    <section style={{ background: 'var(--cream)', translate: '0' }} className="w-full overflow-hidden">
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
              autoComplete="postal-code"
              enterKeyHint="go"
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
