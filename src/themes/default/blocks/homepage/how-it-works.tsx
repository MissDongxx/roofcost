"use client";

export function HowItWorks() {
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
          <div className="bg-white p-8 md:pl-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:z-10 hover:shadow-xl first:rounded-l-[var(--radius-lg)] last:rounded-r-[var(--radius-lg)]" style={{ contain: 'layout style paint' }}>
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
          <div className="bg-white p-8 md:pl-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:z-10 hover:shadow-xl" style={{ contain: 'layout style paint' }}>
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
          <div className="bg-white p-8 md:pl-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:z-10 hover:shadow-xl" style={{ contain: 'layout style paint' }}>
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
