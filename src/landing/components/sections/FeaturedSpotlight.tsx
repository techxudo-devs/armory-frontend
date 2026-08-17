'use client'

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/landing/components/ui/Button";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";
import { Countdown } from "@/landing/components/ui/Countdown";
import { CategoryImage } from "@/landing/components/ui/CategoryIcon";
import { useLiveGames } from "@/landing/hooks/useLiveGames";
import { mapGameToFeatured } from "@/landing/data/games";
import { useGetMeQuery } from "@/lib/api/authApi";

export function FeaturedSpotlight() {
  const router = useRouter();
  const { games } = useLiveGames(12);
  const { data: user, isError: notLoggedIn } = useGetMeQuery();
  const isAdmin = user?.role === "admin";

  const featured =
    [...games].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0] ?? null;
  const raffle = featured ? mapGameToFeatured(featured) : null;

  const href = raffle?.gameCode
    ? notLoggedIn
      ? `/game/${encodeURIComponent(raffle.gameCode)}/details`
      : isAdmin
        ? "/admin"
      : `/game/${encodeURIComponent(raffle.gameCode)}`
    : "#raffles";

  return (
    <section className="bg-[#FBF6EC] pb-10 pt-14 border-t border-[#E8D9C0]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="max-w-[560px] mx-auto text-center mb-14">
          <p className="bg-gradient-to-r from-[#D29A45]/15 to-[#E3C49A]/30 text-[#A96E1F] w-fit mx-auto px-6 py-1.5 rounded-full font-plus">
            Featured this week
          </p>
          <h2 className="text-3xl sm:text-4xl font-plus font-bold leading-tight mt-4 text-[#24140B]">
            The raffle everyone&apos;s watching
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] border border-[#E0CBA4] bg-white shadow-xl shadow-[#A96E1F]/10">
          <div className="relative min-h-[240px] sm:min-h-[340px] bg-gradient-to-br from-[#331E10] to-[#150A06] flex items-center justify-center border-b md:border-b-0 md:border-r border-[#E8D9C0]">
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
                <h3 className="text-2xl sm:text-3xl font-bold font-plus mt-3.5 mb-3.5 text-[#24140B]">
                  {raffle.title}
                </h3>
                <p className="text-sm sm:text-base text-[#8A6A50] font-plus leading-relaxed mb-6">
                  {raffle.description}
                </p>

                <div className="grid grid-cols-3 gap-px bg-[#E8D9C0] border border-[#E8D9C0] mb-7">
                  <div className="bg-white px-2 py-3.5 sm:px-4">
                    <div className="text-[9px] sm:text-[10px] font-plus text-[#9A7A5C] uppercase tracking-wide mb-1">
                      Category
                    </div>
                    <div className="font-plus text-sm sm:text-base font-bold text-[#A96E1F]">
                      {raffle.category}
                    </div>
                  </div>
                  <div className="bg-white px-2 py-3.5 sm:px-4">
                    <div className="text-[9px] sm:text-[10px] font-plus text-[#9A7A5C] uppercase tracking-wide mb-1">
                      Seats filled
                    </div>
                    <div className="font-plus text-sm sm:text-base font-bold text-[#A96E1F]">
                      {raffle.seatsClaimed} / {raffle.seatsTotal}
                    </div>
                  </div>
                  <div className="bg-white px-2 py-3.5 sm:px-4">
                    <div className="text-[9px] sm:text-[10px] font-plus text-[#9A7A5C] uppercase tracking-wide mb-1">
                      Draws in
                    </div>
                    <div className="font-plus text-sm sm:text-base font-bold text-[#A96E1F]">
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
                    onClick={(event) => {
                      if (!isAdmin) return;
                      event.preventDefault();
                      toast.error("Admins cannot join games. Redirecting to admin dashboard.");
                      router.push("/admin");
                    }}
                    className="whitespace-nowrap rounded-lg text-center hover:scale-97 transition-transform duration-300"
                  >
                    Claim your seat
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-16 text-center">
                <p className="text-xl font-plus font-bold text-[#24140B]">No featured raffle yet</p>
                <p className="mt-2 text-sm font-plus text-[#9A7A5C]">
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
