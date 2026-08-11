import type { Raffle } from "@/types";
import { seatGaugeSegments, seatsRemaining } from "@/lib/utils";

interface SeatGaugeProps {
  raffle: Raffle;
  segmentCount?: number;
}

export function SeatGauge({ raffle, segmentCount = 10 }: SeatGaugeProps) {
  const segments = seatGaugeSegments(raffle, segmentCount);
  const remaining = seatsRemaining(raffle);
  const statusLabel = raffle.urgent ? `Only ${remaining} left` : `${remaining} available`;

  return (
    <div className="mt-auto">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`text-xs font-semibold font-plus ${raffle.urgent ? "text-[#B4522C]" : "text-[#8A6A50]"}`}>
          {statusLabel}
        </span>
        <span className="font-plus text-xs text-[#9A7A5C]">
          {raffle.seatsClaimed} / {raffle.seatsTotal}
        </span>
      </div>
      <div className="flex gap-0.5 h-2">
        {segments.map((filled, index) => (
          <div
            key={index}
            className={`flex-1 h-[7px] ${
              filled ? (raffle.urgent ? "bg-[#B4522C]" : "bg-[#D29A45]") : "bg-[#E0CBA4]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
