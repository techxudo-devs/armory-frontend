import { Button } from "@/landing/components/ui/Button";

export function CTABanner() {
  return (
    <section className="pb-24">
      <div className="max-w-[1136px] mx-auto px-8">
        <div className="relative overflow-hidden border border-border-strong text-center px-16 py-16 bg-gradient-to-br from-brass-dim via-[#241409] to-bg-raised">
          <h2 className="text-[32px] font-bold mb-3.5 relative">Your seat is waiting.</h2>
          <p className="text-[15.5px] text-text-secondary mb-8 relative">
            38 raffles live right now, new listings drop every Monday.
          </p>
          <Button href="#raffles" className="relative">
            Browse live raffles
          </Button>
        </div>
      </div>
    </section>
  );
}
