"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from '@/core/i18n/navigation';

const faqs = [
  {
    q: "How accurate is the roof cost calculator?",
    a: "Our calculator uses BLS labor data and real-time material indexes to provide estimates within ±12% of actual contractor quotes when local data is available. Factors like roof complexity and material choice affect the final price."
  },
  {
    q: "What is the average roof replacement cost in 2026?",
    a: "The national average for a 2,000 sq.ft roof replacement ranges from $19,400 to $39,600, depending on materials. Architectural shingles cost $4.50–$7.50 per sq.ft installed, while metal roofing ranges from $10–$18 per sq.ft."
  },
  {
    q: "How do I calculate my roof replacement cost?",
    a: "Enter your ZIP code above to get localized pricing based on your area's labor rates. Then input your roof size, pitch, material preference, and complexity. Our calculator breaks down materials, labor, tear-off, and permits transparently."
  },
  {
    q: "What factors affect roof replacement cost the most?",
    a: "Labor rates vary by location (NYC costs 42% more than national average). Material choice is the biggest variable—3-Tab asphalt costs $3.50–$5.50/sq.ft while slate runs $15–$30/sq.ft. Roof pitch and complexity also impact pricing."
  },
  {
    q: "Does roof material affect long-term cost?",
    a: "Yes. While asphalt lasts 20–30 years, metal and slate can last 50–100 years. Higher upfront cost often means lower lifetime cost due to durability and energy savings. Use our materials guide to compare total value."
  },
  {
    q: "Why do contractors quote different prices?",
    a: "Contractors vary in overhead, profit margin, and quality. Some bundle services or add premiums for complex jobs. Our transparent math-based estimate gives you a fair baseline to negotiate from—no sales pressure required."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[var(--cream-2)]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-12 py-[60px] md:py-[100px]">
        <div className="font-mono text-[11px] text-[var(--rust)] uppercase tracking-[0.12em] mb-3 flex items-center gap-2.5">
          FAQ
          <span className="flex-1 max-w-[48px] h-px bg-[var(--rust)]"></span>
        </div>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-[var(--ink)] tracking-tight mb-3">
          Common questions<br />
          about roof cost.
        </h2>
        <p className="text-[16px] text-[var(--ink-3)] max-w-[520px] leading-[1.7] mb-12">
          Everything you need to know about estimating, comparing, and saving on your roof replacement.
        </p>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-[var(--cream-3)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--cream)]/50 transition-colors"
              >
                <h3 className="font-serif text-[16px] md:text-[18px] text-[var(--slate)] font-medium pr-8">
                  {faq.q}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--rust)] transition-transform duration-200 flex-shrink-0 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-[15px] text-[var(--ink-3)] leading-[1.7]">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-[14px] text-[var(--ink-3)] mb-4">
            Still have questions about roof replacement costs?
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[var(--rust)] font-medium hover:underline"
          >
            Read our detailed guides
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
