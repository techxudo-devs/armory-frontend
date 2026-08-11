import { Button } from "@/landing/components/ui/Button";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";
import { featuredRaffle } from "@/landing/data/raffles";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

const specs = [
  { label: "Retail value", value: formatCurrency(featuredRaffle.retailValue) },
  { label: "Seat price", value: formatCurrency(featuredRaffle.seatPrice) },
  { label: "Draws in", value: featuredRaffle.drawsInLabel },
];

export function FeaturedSpotlight() {
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

        <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] border border-border-strong bg-bg-raised">
          <div className="relative min-h-[240px] sm:min-h-[340px] bg-gradient-to-br from-[#241409] to-[#100602] flex items-center justify-center border-b md:border-b-0 md:border-r border-border-strong">
            <Image
              src={
                "https://images.unsplash.com/photo-1580865767741-37cd59206d74?w=2000&auto=format&fit=crop&q=100&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZpcmVhcm18ZW58MHx8MHx8fDA%3D"
              }
              alt="Featured Raffle Item"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="p-6 sm:p-10 flex flex-col">
            <h3 className="text-2xl sm:text-3xl font-bold font-plus mt-3.5 mb-3.5">
              {featuredRaffle.title}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary font-plus leading-relaxed mb-6">
              {featuredRaffle.description}
            </p>

            <div className="grid grid-cols-3 gap-px bg-border border border-border mb-7">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-bg-raised px-2 py-3.5 sm:px-4">
                  <div className="text-[9px] sm:text-[10px] font-plus text-text-muted uppercase tracking-wide mb-1">
                    {spec.label}
                  </div>
                  <div className="font-plus text-sm sm:text-base font-bold text-brass-light">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mt-auto">
              <div className="flex-1">
                <SeatGauge raffle={featuredRaffle} segmentCount={14} />
              </div>
              <Button
                href="#"
                className="whitespace-nowrap rounded-lg text-center hover:scale-97 transition-transform duration-300"
              >
                Claim your seat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
