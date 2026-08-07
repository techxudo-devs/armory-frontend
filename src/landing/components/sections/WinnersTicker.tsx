import { winners } from "@/landing/data/content";

export function WinnersTicker() {
  const loopedWinners = [...winners, ...winners];

  return (
    <section id="winners" className="bg-panel border-y border-border py-14 overflow-hidden group">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Recent winners</h3>
        </div>
      </div>
      <div className="flex gap-4 w-max animate-scroll group-hover:[animation-play-state:paused]">
        {loopedWinners.map((winner, index) => (
          <div
            key={`${winner.id}-${index}`}
            className="flex-shrink-0 w-[280px] bg-bg-raised border border-border px-5 py-5 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 bg-brass-dim flex items-center justify-center font-plus font-bold text-sm text-brass-light flex-shrink-0">
              {winner.initials}
            </div>
            <div>
              <div className="text-[13.5px] font-semibold">
                {winner.name} — {winner.location}
              </div>
              <div className="text-xs text-text-muted mt-0.5">Won: {winner.item}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
