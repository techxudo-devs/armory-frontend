'use client'

import { useMemo, useState } from "react";
import { Pill } from "@/landing/components/ui/Pill";
import { Button } from "@/landing/components/ui/Button";
import { RaffleCard } from "@/landing/components/ui/RaffleCard";
import { useLiveGames } from "@/landing/hooks/useLiveGames";
import { mapGameToRaffle, gameCategory } from "@/landing/data/games";
import { useGetMeQuery } from "@/lib/api/authApi";
import type { RaffleCategory } from "@/types";

const allLabel = "All raffles";

export function RaffleGrid() {
  const { games, isLoading } = useLiveGames(12);
  const { isError: notLoggedIn } = useGetMeQuery();

  const categories = useMemo(() => {
    const set = new Set<RaffleCategory>();
    games.forEach((g) => set.add(gameCategory(g)));
    return [...set];
  }, [games]);

  const filterOptions = useMemo(
    () => [allLabel, ...categories] as (RaffleCategory | typeof allLabel)[],
    [categories],
  );

  const [activeFilter, setActiveFilter] =
    useState<RaffleCategory | typeof allLabel>(allLabel);

  const raffles = useMemo(
    () =>
      games
        .map(mapGameToRaffle)
        .filter(
          (r) => activeFilter === allLabel || r.category === activeFilter,
        ),
    [games, activeFilter],
  );

  const viewAllHref = notLoggedIn
    ? "/login?next=/dashboard/active-games"
    : "/dashboard/active-games";

  return (
    <section id="raffles" className="bg-[#FBF6EC] border-y border-[#E8D9C0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex justify-center text-center w-full mx-auto gap-4 mb-9">
          <div>
            <p className="bg-gradient-to-r from-[#D29A45]/15 to-[#E3C49A]/30 text-[#A96E1F] w-fit mx-auto px-6 py-1.5 rounded-full font-plus">
              Get your seat now
            </p>
            <h2 className="text-3xl sm:text-4xl font-plus font-bold leading-tight mt-4 text-[#24140B]">
              All raffles, Grab your seat.
            </h2>
          </div>
        </div>

      {categories.length > 1 && (
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
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RaffleCardSkeleton key={i} />
          ))}
        </div>
      ) : raffles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {raffles.map((raffle) => (
            <RaffleCard key={raffle.id} raffle={raffle} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8D9C0] bg-white py-16 text-center">
          <p className="text-lg font-plus font-semibold text-[#24140B]">
            No live raffles right now
          </p>
          <p className="mt-1 text-sm font-plus text-[#9A7A5C]">
            New raffles drop soon — check back in a little while.
          </p>
        </div>
      )}

      <div className="text-center mt-10">
        <Button
          href={viewAllHref}
          variant="outline"
          className="rounded-lg"
        >
          View all raffles
        </Button>
      </div>
      </div>
    </section>
  );
}

function RaffleCardSkeleton() {
  return (
    <div className="animate-pulse bg-white border border-[#E8D9C0] rounded-xl">
      <div className="h-60 bg-gradient-to-br from-[#331E10] to-[#150A06] border-b border-[#E8D9C0] rounded-t-xl" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-6 w-24 rounded bg-[#E8D9C0]" />
        <div className="h-5 w-full rounded bg-[#E8D9C0]" />
        <div className="h-2.5 w-full rounded bg-[#E0CBA4]" />
        <div className="mt-2 h-11 w-full rounded bg-[#E0CBA4]" />
      </div>
    </div>
  );
}
