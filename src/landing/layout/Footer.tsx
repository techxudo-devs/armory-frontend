const footerColumns = [
  {
    title: "Browse",
    links: ["Knives", "Optics", "Ammo", "Accessories"]
  },
  {
    title: "Company",
    links: ["How it works", "Winners", "Official rules", "Support"]
  },
  {
    title: "Legal",
    links: ["Terms of service", "Privacy policy", "Sweepstakes rules"]
  }
];

export function Footer() {
  return (
    <footer className="pt-10 pb-8 border-t border-border/50">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-14">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] bg-brass relative">
                <span className="absolute inset-1.5 bg-bg" />
              </div>
              <div className="font-plus font-bold text-[19px] tracking-wide">
                IGY6<span className="text-brass-light">ARMONY</span>
              </div>
            </div>
            <p className="text-xs text-text-muted font-plus mt-3.5 max-w-[280px] leading-relaxed">
              Seat-based gear raffles for people who&apos;d rather earn a shot at premium kit than pay full retail.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h5 className="text-xs font-semibold font-plus uppercase tracking-widest text-text-muted mb-5">{column.title}</h5>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[13.5px] font-plus text-text-secondary hover:text-text-primary transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap font-plus justify-between items-center gap-3.5 pt-7 border-t border-border">
          <div className="text-xs text-text-muted">
            © 2026 IGY6ARMONY. Void where prohibited. 18+ only. Firearms transfer via licensed FFL.
          </div>
          <div className="text-xs text-text-muted">Licensed & bonded raffle operator</div>
        </div>
      </div>
    </footer>
  );
}
