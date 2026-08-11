'use client'

import Image from "next/image";
import type { Raffle } from "@/types";
import { CategoryImage } from "@/landing/components/ui/CategoryIcon";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";
import { useGetMeQuery } from "@/lib/api/authApi";

interface RaffleCardProps {
  raffle: Raffle;
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const { isError: notLoggedIn } = useGetMeQuery();
  const href = raffle.gameCode
    ? notLoggedIn
      ? `/login?next=/game/${encodeURIComponent(raffle.gameCode)}`
      : `/game/${encodeURIComponent(raffle.gameCode)}`
    : "#";

  return (
    <div className="bg-panel border border-border rounded-xl flex flex-col transition-all duration-300 hover:border-border-strong hover:-translate-y-1">
      <div className="relative h-60 flex items-center justify-center bg-gradient-to-br from-[#241409] to-[#100602] border-b border-border rounded-xl overflow-hidden">
        {raffle.imageUrl ? (
          <Image
            src={raffle.imageUrl}
            alt={raffle.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <CategoryImage category={raffle.category} className="w-full h-full" />
        )}
        <span
          className={`absolute top-3 left-3 z-10 text-[10.5px] font-plus font-medium rounded-full tracking-wide uppercase px-2.5 py-1 border ${
            raffle.urgent
              ? "border-signal text-signal-light bg-signal-dim/90"
              : "border-border-strong text-text-secondary bg-bg/85"
          }`}
        >
          {raffle.category}
        </span>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="text-base font-plus font-semibold leading-snug min-h-[40px]">
          {raffle.title}
        </div>
        <SeatGauge raffle={raffle} />
        <a
          href={href}
          className="mt-1 w-full text-center border border-border-strong font-plus font-medium text-[12.5px] tracking-wide uppercase py-3 transition-colors hover:bg-brass hover:border-brass hover:text-[#1a1408] duration-300"
        >
          Claim your seat
        </a>
      </div>
    </div>
  );
}
