import { LayoutGrid, PlayCircle, ShieldCheck } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: LayoutGrid,
    title: "Pick your gear",
    description:
      "Browse live raffles across knives, optics, ammo, and accessories. Every listing shows real retail value and seats remaining.",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Claim your seat",
    description:
      "Pay the per-seat price to lock in your entry. The fewer seats sold, the better your odds—track progress live on the gauge.",
  },
  {
    number: "03",
    icon: PlayCircle,
    title: "Watch the draw",
    description:
      "Once every seat is claimed, the winner is drawn live on camera and gear ships within 48 hours.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="bg-[#0B101D] border-y border-[#121721] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="max-w-xl mx-auto text-center mb-12">
          <p className="bg-gradient-to-r from-amber-500/20 to-amber-500/40 text-white w-fit mx-auto px-6 py-1.5 rounded-full font-plus">
            How it works
          </p>
          <h2 className="text-4xl font-plus font-bold text-white mt-2">
            Three steps, no catch
          </h2>
          <p className="text-base font-plus text-[#94A3B8] mt-2 leading-relaxed">
            Simple and transparent process for entering live seat-based webinars.
          </p>
        </div>

        {/* Clean 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#131B2E] border border-[#1F293D] rounded-xl p-6"
              >
                {/* Icon & Step Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-lg bg-[#0B101D] border border-[#1F293D] flex items-center justify-center text-[#E53535]">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-plus text-xs font-medium text-[#94A3B8] bg-[#0B101D] px-2.5 py-1 rounded border border-[#1F293D]">
                    {step.number}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-semibold font-plus text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm font-plus text-[#94A3B8] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}