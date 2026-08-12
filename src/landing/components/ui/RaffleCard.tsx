'use client'

import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Raffle } from "@/types";
import { CategoryImage } from "@/landing/components/ui/CategoryIcon";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";
import { useGetMeQuery } from "@/lib/api/authApi";

interface RaffleCardProps {
  raffle: Raffle;
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  const router = useRouter();
  const { data: user, isError: notLoggedIn } = useGetMeQuery();
  const isAdmin = user?.role === "admin";
  const href = raffle.gameCode
    ? notLoggedIn
      ? `/login?next=/game/${encodeURIComponent(raffle.gameCode)}`
      : isAdmin
        ? "/admin"
      : `/game/${encodeURIComponent(raffle.gameCode)}`
    : "#";

  return (
    <div className="bg-white border border-[#E8D9C0] rounded-xl flex flex-col transition-all duration-300 hover:border-[#D29A45]/70 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#A96E1F]/10">
      <div className="relative h-60 flex items-center justify-center bg-gradient-to-br from-[#331E10] to-[#150A06] border-b border-[#E8D9C0] rounded-xl overflow-hidden">
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
        <div className="text-base font-plus font-semibold leading-snug min-h-[40px] text-[#24140B]">
          {raffle.title}
        </div>
        <SeatGauge raffle={raffle} />
        <a
          href={href}
          onClick={(event) => {
            if (!isAdmin) return;
            event.preventDefault();
            toast.error("Admins cannot join games. Redirecting to admin dashboard.");
            router.push("/admin");
          }}
          className="mt-1 w-full text-center border border-[#E0CBA4] font-plus font-medium text-[12.5px] tracking-wide uppercase py-3 transition-colors text-[#A96E1F] hover:bg-gradient-to-r hover:from-[#D29A45] hover:to-[#E3C49A] hover:border-transparent hover:text-[#1a1408] duration-300"
        >
          Claim your seat
        </a>
      </div>
    </div>
  );
}
