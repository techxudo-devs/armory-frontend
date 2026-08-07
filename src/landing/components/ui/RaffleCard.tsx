import type { Raffle } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { CategoryImage } from "@/landing/components/ui/CategoryIcon";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";

interface RaffleCardProps {
  raffle: Raffle;
}

export function RaffleCard({ raffle }: RaffleCardProps) {
  return (
    <div className="bg-panel border border-border rounded-xl flex flex-col transition-all hover:border-border-strong hover:-translate-y-1">
      <div className="relative h-60 flex items-center justify-center bg-gradient-to-br from-[#1C2024] to-[#12151A] border-b border-border rounded-xl overflow-hidden">
        <CategoryImage category={raffle.category} className="w-full h-full" />
        <span
          className={`absolute top-3 left-3 z-10 text-[10.5px] font-plus font-medium rounded-full tracking-wide uppercase px-2.5 py-1 border ${
            raffle.urgent
              ? "border-signal text-signal-light bg-signal-dim/90"
              : "border-border-strong text-text-secondary bg-bg/85"
          }`}
        >
          {raffle.category}
        </span>
        {/* <CategoryImage category={raffle.category} className="w-full h-full" /> */}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-plus text-xl font-bold text-brass-light">
            {formatCurrency(raffle.seatPrice)}
          </span>
          <span className="text-[11px] font-plus text-text-muted uppercase">/ seat</span>
        </div>
        <div className="text-base font-plus font-semibold leading-snug min-h-[40px]">
          {raffle.title}
        </div>
        <SeatGauge raffle={raffle} />
        <a
          href="#"
          className="mt-1 w-full text-center border border-border-strong font-plus font-medium text-[12.5px] tracking-wide uppercase py-3 transition-colors hover:bg-brass hover:border-brass hover:text-[#1a1408] duration-300"
        >
          Claim your seat
        </a>
      </div>
    </div>
  );
}
