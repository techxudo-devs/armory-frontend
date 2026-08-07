"use client";

import { useMemo, useState } from "react";
import { Pill } from "@/landing/components/ui/Pill";
import { Button } from "@/landing/components/ui/Button";
import { RaffleCard } from "@/landing/components/ui/RaffleCard";
import { raffles } from "@/landing/data/raffles";
import type { RaffleCategory } from "@/types";

const filterOptions: (RaffleCategory | "All raffles")[] = [
  "All raffles",
  "Knives",
  "Optics",
  "Ammo",
  "Accessories",
  "Firearms",
];

export function RaffleGrid() {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filterOptions)[number]>("All raffles");

  const filteredRaffles = useMemo(() => {
    if (activeFilter === "All raffles") return raffles;
    return raffles.filter((raffle) => raffle.category === activeFilter);
  }, [activeFilter]);

  return (
    <section id="raffles" className="max-w-[1200px] mx-auto px-8 py-10">
      <div className="flex justify-center text-center w-full mx-auto gap-4 mb-9">
        <div>
                  <p className="bg-gradient-to-r from-amber-500/20 to-amber-500/40 text-white w-fit mx-auto px-6 py-1.5 rounded-full font-plus">
            Get your seat now
          </p>
          <h2 className="text-4xl font-plus font-bold leading-tight mt-4">
            All raffles, Grab your seat.
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5 mb-9">
        {filterOptions.map((option) => (
          <Pill
            key={option}
            label={option}
            active={activeFilter === option}
            onClick={() => setActiveFilter(option)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRaffles.map((raffle) => (
          <RaffleCard key={raffle.id} raffle={raffle} />
        ))}
      </div>

      <div className="text-center mt-10">
        <Button href="#" variant="outline" className="rounded-lg">
          View all 38 raffles
        </Button>
      </div>
    </section>
  );
}
