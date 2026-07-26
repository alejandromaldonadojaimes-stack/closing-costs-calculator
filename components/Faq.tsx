"use client";

import { useState } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export default function Faq({ heading, items }: { heading: string; items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="mt-16">
      <h2 id="faq-heading" className="font-display text-display-sm font-medium tracking-tight text-ink-900">
        {heading}
      </h2>
      <div className="mt-6 divide-y divide-ink-200 overflow-hidden rounded-[24px] border border-ink-200/70 bg-white shadow-card">
        {items.map((item, index) => {
          const open = openIndex === index;
          const panelId = `faq-panel-${index}`;
          return (
            <div key={item.question}>
              <button
                type="button"
                id={`faq-trigger-${index}`}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-colors duration-150 ease-out hover:bg-ink-50/70"
              >
                <span className="font-medium text-ink-800">{item.question}</span>
                <span
                  aria-hidden
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-transform duration-250 ease-out-expo ${
                    open ? "rotate-45 border-brand-300 bg-brand-50 text-brand-700" : ""
                  }`}
                >
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                    <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={`faq-trigger-${index}`}
                className={`grid overflow-hidden transition-[grid-template-rows] duration-[350ms] ease-in-out-quart ${
                  open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p
                    className={`px-6 pb-5 text-sm leading-relaxed text-ink-600 transition-opacity ${
                      open ? "opacity-100 duration-300 delay-100" : "opacity-0 duration-150"
                    }`}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Datos estructurados FAQPage para resultados enriquecidos en Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
