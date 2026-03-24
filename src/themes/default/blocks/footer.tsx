import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Footer as FooterType } from '@/shared/types/blocks/landing';

export function Footer({ footer = {} as FooterType }: { footer: FooterType }) {
  return (
    <footer className="bg-[var(--ink)] py-16 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-12 border-b border-white/10 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 no-underline mb-4 group">
              <div className="bg-white/5 p-2 rounded-lg group-hover:bg-white/10 transition-colors">
                <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                  <path d="M6 20 L18 8 L30 20" stroke="var(--rust)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <rect x="10" y="20" width="16" height="10" rx="1" fill="rgba(255,255,255,.2)"/>
                  <text x="14" y="28" fontFamily="var(--font-serif)" fontSize="12" fill="white" fontStyle="italic">$</text>
                </svg>
              </div>
              <span className="font-serif text-lg text-white font-medium tracking-tight">RoofCostAI</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs mb-6">
              Providing transparent, math-based roofing estimates for American homeowners. Simple, accurate, and free.
            </p>
            <div className="flex items-center gap-3">
              <Link href="mailto:info@roofcostai.com" className="bg-white/5 p-2 rounded-full hover:bg-[var(--rust)] transition-all hover:scale-110 flex items-center justify-center">
                <SmartIcon name="Mail" size={16} color="white" />
              </Link>
              <span className="text-[13px] text-white/40 italic">info@roofcostai.com</span>
            </div>
          </div>

          {/* Calculator Column */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-white/30 uppercase tracking-widest font-bold mb-2">Calculator</h4>
            <Link href="/calculator" className="text-[14px] text-white/50 hover:text-white transition-colors">Get Estimate</Link>
            <Link href="/roof-cost" className="text-[14px] text-white/50 hover:text-white transition-colors">Price Guide</Link>
            <Link href="/materials" className="text-[14px] text-white/50 hover:text-white transition-colors">Materials</Link>
          </div>

          {/* Cities Column */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-white/30 uppercase tracking-widest font-bold mb-2">Top Cities</h4>
            <Link href="/roof-cost/texas/houston" className="text-[14px] text-white/50 hover:text-white transition-colors">Houston, TX</Link>
            <Link href="/roof-cost/california/los-angeles" className="text-[14px] text-white/50 hover:text-white transition-colors">Los Angeles, CA</Link>
            <Link href="/roof-cost/florida/miami" className="text-[14px] text-white/50 hover:text-white transition-colors">Miami, FL</Link>
            <Link href="/roof-cost/illinois/chicago" className="text-[14px] text-white/50 hover:text-white transition-colors">Chicago, IL</Link>
            <Link href="/roof-cost/arizona/phoenix" className="text-[14px] text-white/50 hover:text-white transition-colors">Phoenix, AZ</Link>
          </div>

          {/* Company & Support Column */}
          <div className="flex flex-col gap-3">
            <h4 className="font-mono text-[11px] text-white/30 uppercase tracking-widest font-bold mb-2">Company</h4>
            <Link href="/about" className="text-[14px] text-white/50 hover:text-white transition-colors">About Us</Link>
            <Link href="/privacy-policy" className="text-[14px] text-white/50 hover:text-white transition-colors font-medium">Privacy Policy</Link>
            <Link href="/terms-of-service" className="text-[14px] text-white/50 hover:text-white transition-colors font-medium">Terms of Service</Link>
            <Link href="/contact" className="text-[14px] text-white/50 hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="text-[13px] text-white/40">© 2026 RoofCostAI. All rights reserved.</span>
            <p className="text-[11px] text-white/20">Data sourced from BLS, RSMeans, and 1build market data APIs.</p>
          </div>

          <Link href="/" className="flex items-center gap-2 no-underline opacity-50 hover:opacity-100 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <path d="M6 20 L18 8 L30 20" stroke="var(--rust)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <rect x="10" y="20" width="16" height="10" rx="1" fill="rgba(255,255,255,.2)"/>
            </svg>
            <span className="font-serif text-sm text-white tracking-tight italic">RoofCostAI</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
