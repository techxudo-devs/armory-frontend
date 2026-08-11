import { CheckCircle2, Lock, Timer, Trophy } from "lucide-react";
import { Button } from "@/landing/components/ui/Button";
import { SeatGauge } from "@/landing/components/ui/SeatGauge";
import Image from "next/image";

const stats = [
  { value: "38", label: "Raffles live" },
  { value: "$412K", label: "Gear given away" },
  { value: "2,140", label: "Seats this week" },
];

const trustItems = [
  { icon: Lock, label: "Secure checkout, PCI-compliant" },
  { icon: Timer, label: "Live draws, no delay" },
  { icon: CheckCircle2, label: "Ships within 48 hours" },
  { icon: Trophy, label: "Licensed & bonded raffle operator" },
];

export function Hero() {
  return (
    <section className="relative pt-[50px] overflow-hidden bg-[radial-gradient(ellipse_900px_500px_at_78%_-10%,rgba(192,143,69,0.14),transparent_60%)]">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
          <div className="animate-fadeUp">
            <h1 className="text-6xl font-plus leading-[1.01] font-bold mt-6 mb-6">
              Premium gear
              <br />
              One <span className="text-brass-light">seat</span> away.
            </h1>
            <p className="text-lg text-text-secondary max-w-[480px] mb-9 leading-relaxed font-plus">
              Claim a seat on the gear you actually want, knives, optics, ammo,
              and kit, for a fraction of retail. Every listing draws live once
              seats sell out, no exceptions.
            </p>
            <div className="flex items-center gap-3.5 mb-10">
              <Button
                href="#raffles"
                className="rounded-lg font-plus hover:scale-97 transition-transform duration-300"
              >
                Browse live raffles
              </Button>
              <Button href="#how" variant="ghost">
                See how it works →
              </Button>
            </div>
            <div className="flex gap-11 flex-wrap">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="font-plus text-2xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-xs text-text-muted uppercase tracking-wide font-plus mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block animate-fadeUp [animation-delay:.2s] relative">
            <div className="bg-panel border border-border-strong p-6 rounded-2xl relative">
              {/* <div className="flex justify-between items-start mb-6">
                <span className="text-[11px] font-semibold tracking-wide uppercase text-signal-light bg-signal-dim border border-signal px-2.5 py-1">
                  2 seats left
                </span>
                <div className="text-right">
                  <span className="font-plus text-[26px] font-bold text-brass-light">
                    {formatCurrency(featuredRaffle.seatPrice)}
                  </span>
                  <span className="block text-[11px] text-text-muted uppercase mt-0.5">per seat</span>
                </div>
              </div> */}
              <div className="text-2xl font-plus font-semibold mb-5">
                Custom Field Knife, Walnut Handle, Damascus Blade
              </div>
              <div className="relative h-[200px] border border-border mb-5 flex items-center justify-center overflow-hidden rounded-xl">
                {/* <Feather className="w-14 h-14 text-text-muted opacity-55" strokeWidth={1.4} /> */}
                <Image
                  src="https://images.unsplash.com/photo-1621124998834-5e395fcf9d76?w=2000&auto=format&fit=crop&q=100&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGtuaWZlJTIwYmxhZGV8ZW58MHx8MHx8fDA%3D"
                  alt="Featured Raffle Item"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-center"
                />
              </div>
              <SeatGauge
                raffle={{
                  id: "hero-preview",
                  category: "Knives",
                  title: "",
                  seatsTotal: 30,
                  seatsClaimed: 28,
                  urgent: true,
                }}
                segmentCount={15}
              />
              <a
                href="#"
                className="mt-5 w-full block text-center py-3.5 bg-brass text-white font-bold text-sm font-plus tracking-wide uppercase hover:scale-97 transition-transform duration-300 rounded-lg"
              >
                Claim your seat
              </a>

              {/* <div className="absolute -top-4.5 -left-8.5 bg-bg-raised border border-border-strong px-5 py-3.5 flex items-center gap-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]">
                <div className="w-8 h-8 bg-brass-dim flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-brass-light" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold">Draw verified</div>
                  <div className="text-[11px] text-text-muted">Recorded &amp; timestamped</div>
                </div>
              </div> */}

              {/* <div className="absolute bottom-3.5 -right-9.5 bg-bg-raised border border-border-strong px-5 py-3.5 flex items-center gap-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)]">
                <div className="w-8 h-8 bg-brass-dim flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-brass-light" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-[13px] font-semibold">Winner: J. Ramos</div>
                  <div className="text-[11px] text-text-muted">Claimed 2 min ago</div>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 py-7">
          <div className="flex flex-wrap items-center justify-between gap-8">
            {trustItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 text-[13px] font-plus text-text-muted"
              >
                <item.icon
                  className="w-4 h-4 flex-shrink-0"
                  strokeWidth={1.6}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
