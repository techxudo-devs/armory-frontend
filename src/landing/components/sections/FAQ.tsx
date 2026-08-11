"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqEntries } from "@/landing/data/content";

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqEntries[0]?.id ?? null);

  return (
    <section id="faq" className="bg-gradient-to-b from-bg via-bg-raised to-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* Left Column: Title & Subtext (Sticky on Desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <p className="bg-gradient-to-r from-amber-500/20 to-amber-500/40 text-white  w-fit px-6 py-1.5 rounded-full font-plus">
            Questions
          </p>
          <h2 className="text-3xl sm:text-4xl font-plus font-bold text-white mt-3 leading-tight">
            Frequently asked
          </h2>
          <p className="text-sm text-text-secondary mt-3 font-plus leading-relaxed max-w-md">
            Everything you need to know about seat entries, live drawings, and item fulfillment.
          </p>
        </div>

        {/* Right Column: Accordion Items */}
        <div className="lg:col-span-7 space-y-3">
          {faqEntries.map((entry) => {
            const isOpen = openId === entry.id;
            return (
              <div
                key={entry.id}
                className={`border rounded-lg transition-colors duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-card border-brass/50"
                    : "bg-bg/40 border-border hover:border-brass/40"
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : entry.id)}
                  className="w-full flex items-center justify-between p-5 text-left text-base font-semibold text-white gap-4 transition-colors duration-300 cursor-pointer"
                >
                  <span className={isOpen ? "text-white font-plus" : "text-white/90 font-plus"}>
                    {entry.question}
                  </span>
                  
                  {/* Plus/Close Icon Badge */}
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center shrink-0 border transition-all duration-200 ${
                      isOpen
                        ? "bg-brass border-brass text-bg rotate-45"
                        : "bg-card border-border text-text-secondary"
                    }`}
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </div>
                </button>

                {/* Smooth Expanding Answer Container */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 px-5 pb-5"
                      : "grid-rows-[0fr] opacity-0 px-5 pb-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-text-secondary leading-relaxed pt-3 border-t border-border/80 font-plus">
                      {entry.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}