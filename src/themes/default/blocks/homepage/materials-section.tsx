"use client";

import { Link } from '@/core/i18n/navigation';

export function Materials() {
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
              style={{ contain: 'layout style paint' }}
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
