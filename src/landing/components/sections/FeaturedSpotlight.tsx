'use client'

import Image from "next/image";
import { Button } from "@/landing/components/ui/Button";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";
import { Countdown } from "@/landing/components/ui/Countdown";
import { CategoryImage } from "@/landing/components/ui/CategoryIcon";
import { useLiveGames } from "@/landing/hooks/useLiveGames";
import { mapGameToFeatured, fillRatio } from "@/landing/data/games";
import { useGetMeQuery } from "@/lib/api/authApi";

export function FeaturedSpotlight() {
  const { games } = useLiveGames(12);
  const { isError: notLoggedIn } = useGetMeQuery();

  const featured =
    [...games].sort((a, b) => fillRatio(b) - fillRatio(a))[0] ?? null;
  const raffle = featured ? mapGameToFeatured(featured) : null;

  const href = raffle?.gameCode
    ? notLoggedIn
      ? `/login?next=/game/${encodeURIComponent(raffle.gameCode)}`
      : `/game/${encodeURIComponent(raffle.gameCode)}`
    : "#raffles";

  return (
    <section className="bg-bg pb-10 pt-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="max-w-[560px] mx-auto text-center mb-14">
          <p className="bg-gradient-to-r from-amber-500/20 to-amber-500/40 text-white w-fit mx-auto px-6 py-1.5 rounded-full font-plus">
            Featured this week
          </p>
          <h2 className="text-3xl sm:text-4xl font-plus font-bold leading-tight mt-4">
            The raffle everyone&apos;s watching
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] border border-border-strong surface-card">
          <div className="relative min-h-[240px] sm:min-h-[340px] bg-gradient-to-br from-[#331E10] to-[#150A06] flex items-center justify-center border-b md:border-b-0 md:border-r border-border-strong">
            {raffle?.imageUrl ? (
              <Image
                src={raffle.imageUrl}
                alt={raffle.title}
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover object-center"
              />
            ) : raffle ? (
              <CategoryImage category={raffle.category} className="w-full h-full" />
            ) : (
              <span className="font-plus text-5xl text-brass-dim">◆</span>
            )}
          </div>

          <div className="p-6 sm:p-10 flex flex-col">
            {raffle ? (
              <>
                <h3 className="text-2xl sm:text-3xl font-bold font-plus mt-3.5 mb-3.5">
                  {raffle.title}
                </h3>
                <p className="text-sm sm:text-base text-text-secondary font-plus leading-relaxed mb-6">
                  {raffle.description}
                </p>

                <div className="grid grid-cols-3 gap-px bg-border border border-border mb-7">
                  <div className="surface-raised px-2 py-3.5 sm:px-4">
                    <div className="text-[9px] sm:text-[10px] font-plus text-text-muted uppercase tracking-wide mb-1">
                      Category
                    </div>
                    <div className="font-plus text-sm sm:text-base font-bold text-brass-light">
                      {raffle.category}
                    </div>
                  </div>
                  <div className="surface-raised px-2 py-3.5 sm:px-4">
                    <div className="text-[9px] sm:text-[10px] font-plus text-text-muted uppercase tracking-wide mb-1">
                      Seats filled
                    </div>
                    <div className="font-plus text-sm sm:text-base font-bold text-brass-light">
                      {raffle.seatsClaimed} / {raffle.seatsTotal}
                    </div>
                  </div>
                  <div className="surface-raised px-2 py-3.5 sm:px-4">
                    <div className="text-[9px] sm:text-[10px] font-plus text-text-muted uppercase tracking-wide mb-1">
                      Draws in
                    </div>
                    <div className="font-plus text-sm sm:text-base font-bold text-brass-light">
                      <Countdown to={raffle.endDate} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-auto">
                  <div className="flex-1">
                    <SeatGauge raffle={raffle} segmentCount={14} />
                  </div>
                  <Button
                    href={href}
                    className="whitespace-nowrap rounded-lg text-center hover:scale-97 transition-transform duration-300"
                  >
                    Claim your seat
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-xl font-plus font-bold">No featured raffle yet</p>
                <p className="mt-2 text-sm font-plus text-text-muted">
                  The most-claimed live raffle will appear here.
                </p>
                <div className="mt-6">
                  <Button href="#raffles" className="rounded-lg">
                    Browse live raffles
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
