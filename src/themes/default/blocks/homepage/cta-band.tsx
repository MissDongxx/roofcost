"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CTABand() {
  const router = useRouter();
  const [zip, setZip] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zip.length === 5 && /^\d{5}$/.test(zip)) {
      router.push(`/calculator?zip=${zip}`);
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setZip(value);
  };

  return (
    <div className="bg-[var(--rust)] py-16 px-4 md:px-12 text-center relative overflow-hidden" style={{ willChange: 'transform' }}>
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
            onChange={handleZipChange}
            className="flex-1 border-none outline-none bg-transparent font-mono text-lg font-medium text-[var(--ink)] tracking-[0.08em]"
            maxLength={5}
            autoComplete="postal-code"
            enterKeyHint="go"
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
