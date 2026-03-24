"use client";

export function SocialProof() {
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
            <div className="bg-white rounded-lg p-6 shadow-sm" style={{ contain: 'layout style paint' }}>
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
            <div className="bg-white rounded-lg p-6 shadow-sm" style={{ contain: 'layout style paint' }}>
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
            <div className="bg-[var(--slate)] rounded-lg p-5 px-6 flex items-center gap-4" style={{ contain: 'layout style paint' }}>
              <div className="font-serif text-[36px] text-white leading-none shrink-0">
                142<em className="text-[rgba(192,57,43,.9)] italic">K</em>
              </div>
              <div className="text-[13px] text-white/65 leading-[1.5]">
                estimates generated for homeowners across the US in the past 12 months
              </div>
            </div>
            <div className="bg-[var(--slate)] rounded-lg p-5 px-6 flex items-center gap-4" style={{ contain: 'layout style paint' }}>
              <div className="font-serif text-[36px] text-white leading-none shrink-0">
                <em className="text-[rgba(192,57,43,.9)] italic">±</em>12<em className="text-[rgba(192,57,43,.9)] italic">%</em>
              </div>
              <div className="text-[13px] text-white/65 leading-[1.5]">
                typical accuracy vs. real contractor quotes when local data is available
              </div>
            </div>
            <div className="bg-[var(--rust)] rounded-lg p-5 px-6 flex items-center gap-4" style={{ contain: 'layout style paint' }}>
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
