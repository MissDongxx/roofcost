'use client';

import { useState } from 'react';
import { Link } from '@/core/i18n/navigation';
import { Header as HeaderType } from '@/shared/types/blocks/landing';

export function Header({ header = {} as HeaderType }: { header: HeaderType }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[var(--slate)] h-[var(--nav-height)] flex items-center px-4 md:px-12 gap-8 shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
          <div className="w-9 h-9 relative">
            <svg className="block" width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="8" fill="rgba(255,255,255,.1)"/>
              <path d="M6 20 L18 8 L30 20" stroke="var(--rust)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="10" y="20" width="16" height="10" rx="1" fill="rgba(255,255,255,.15)"/>
              <text x="14" y="28" fontFamily="var(--font-serif)" fontSize="12" fill="rgba(255,255,255,.9)" fontStyle="italic">$</text>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-serif text-lg text-white -tracking-[0.2px]">RoofCostAI</span>
            <span className="font-mono text-[9px] text-white/70 tracking-[0.12em] uppercase mt-0.5">Honest Estimates</span>
          </div>
        </Link>

        <nav className="hidden md:flex gap-1 ml-auto">
          <Link href="/calculator" className="text-white/65 text-sm no-underline px-3 py-1.5 rounded-md transition-all hover:text-white hover:bg-white/8">
            Calculator
          </Link>
          <Link href="/roof-cost" className="text-white/65 text-sm no-underline px-3 py-1.5 rounded-md transition-all hover:text-white hover:bg-white/8">
            Price Guide
          </Link>
          <Link href="/materials" className="text-white/65 text-sm no-underline px-3 py-1.5 rounded-md transition-all hover:text-white hover:bg-white/8">
            Materials
          </Link>
          <Link href="/blog" className="text-white/65 text-sm no-underline px-3 py-1.5 rounded-md transition-all hover:text-white hover:bg-white/8">
            Learn
          </Link>
        </nav>

        <Link href="/calculator" className="hidden md:block bg-[var(--rust)] text-white text-sm font-medium px-4.5 py-2 rounded-lg no-underline transition-colors hover:bg-[var(--rust-2)] whitespace-nowrap ml-2">
          Get Estimate →
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden relative z-20 -m-2.5 -mr-3 block cursor-pointer p-2.5 text-white/70 hover:text-white"
          aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          <svg className={`w-5 h-5 transition-transform duration-200 ${isMobileMenuOpen ? 'scale-0 rotate-180 opacity-0' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg className={`absolute inset-0 m-auto w-5 h-5 transition-transform duration-200 ${isMobileMenuOpen ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-180 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 top-[var(--nav-height)] z-40 bg-[var(--slate)] md:hidden">
            <div className="flex flex-col p-4 gap-2">
              <Link href="/calculator" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-base py-3 no-underline border-b border-white/10">
                Calculator
              </Link>
              <Link href="/roof-cost" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-base py-3 no-underline border-b border-white/10">
                Price Guide
              </Link>
              <Link href="/materials" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-base py-3 no-underline border-b border-white/10">
                Materials
              </Link>
              <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-white text-base py-3 no-underline border-b border-white/10">
                Learn
              </Link>
              <Link href="/calculator" onClick={() => setIsMobileMenuOpen(false)} className="bg-[var(--rust)] text-white text-center text-sm font-medium py-3 rounded-lg no-underline mt-4">
                Get Estimate →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
