'use client'

import { CheckCircle2, Lock, Timer, Trophy } from "lucide-react";
import { Button } from "@/landing/components/ui/Button";
import { useLiveGames } from "@/landing/hooks/useLiveGames";

const trustItems = [
  { icon: Lock, label: "Secure checkout, PCI-compliant" },
  { icon: Timer, label: "Live draws, no delay" },
  { icon: CheckCircle2, label: "Ships within 48 hours" },
  { icon: Trophy, label: "Licensed & bonded raffle operator" },
];

export function Hero2() {
  const { games, isLoading } = useLiveGames(12);

  const seatsTotal = games.reduce((sum, g) => sum + (g.totalSeats || 0), 0);

  const stats = [
    { value: isLoading ? "…" : String(games.length), label: "Raffles live" },
    { value: "$412K", label: "Gear given away" },
    { value: isLoading ? "…" : seatsTotal.toLocaleString(), label: "Seats live" },
  ];
  return (
    <section className="relative flex items-center overflow-hidden pt-3">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/heroVido.mp4"
      />
      <div className="absolute inset-0 bg-bg/70" />
      <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="animate-fadeUp text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-plus leading-[1.05] sm:leading-[1.01] font-bold mt-6 mb-6">
            Premium gear,
            <br />
            One <span className="text-brass-light">seat</span> away.
          </h1>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mb-9 leading-relaxed font-plus mx-auto">
            Claim a seat on the gear you actually want, knives, optics, ammo,
            and kit, for a fraction of retail. Every listing draws live once
            seats sell out, no exceptions.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 mb-10">
            <Button
              href="#raffles"
              className="rounded-lg text-center font-plus hover:scale-97 transition-transform duration-300"
            >
              Browse live raffles
            </Button>
            <Button
              href="#how"
              variant="ghost"
              className="justify-center text-center"
            >
              See how it works →
            </Button>
          </div>
          <div className="flex gap-7 sm:gap-11 flex-wrap justify-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-plus text-xl sm:text-2xl font-bold">{stat.value}</div>
                <div className="text-[11px] sm:text-xs text-text-muted uppercase tracking-wide font-plus mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border mt-12 py-7">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-8">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 text-[12px] sm:text-[13px] font-plus text-text-muted"
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0"
                  strokeWidth={1.6}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
