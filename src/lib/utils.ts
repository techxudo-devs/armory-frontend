import type { Raffle } from "@/types";

export function seatsRemaining(raffle: Raffle): number {
  return raffle.seatsTotal - raffle.seatsClaimed;
}

export function seatGaugeSegments(raffle: Raffle, segmentCount = 10): boolean[] {
  const filledCount = Math.round((raffle.seatsClaimed / raffle.seatsTotal) * segmentCount);
  return Array.from({ length: segmentCount }, (_, index) => index < filledCount);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);
}
