"use client";

export function StatsBar() {
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
