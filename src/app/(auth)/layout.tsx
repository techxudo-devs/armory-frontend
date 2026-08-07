import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-text-primary relative overflow-y-auto flex flex-col items-center px-6 py-6 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(229,53,53,0.10),transparent_60%)]">
      <Link href="/" className="flex items-center gap-2.5 mb-6">
        <div className="w-[30px] h-[30px] bg-brass relative">
          <span className="absolute inset-1.5 bg-bg" />
        </div>
        <div className="font-plus font-bold text-[19px] tracking-wide">
          IGY6<span className="text-brass-light">ARMORY</span>
        </div>
      </Link>

      <div className="w-full max-w-[560px] my-auto">{children}</div>

      <p className="mt-6 my-auto text-xs text-text-muted font-plus text-center max-w-[400px] leading-relaxed">
        Licensed &amp; bonded raffle operator. 18+ only. Void where prohibited.
      </p>
    </div>
  );
}
