import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-text-primary relative overflow-y-auto flex flex-col items-center px-6 py-6 bg-[radial-gradient(ellipse_800px_500px_at_50%_-10%,rgba(199,140,58,0.12),transparent_60%)]">
      <Link href="/" prefetch={false} className="flex items-center gap-2.5 mb-6">
        <Image
          src="/images/logo.jpeg"
          alt="Metal Tubes & Seeds"
          width={1600}
          height={936}
          className="h-10 w-auto object-contain"
        />
        <div className="font-plus font-bold text-[19px] tracking-wide">
          Metal Tubes <span className="text-brass-light">&amp; Seeds</span>
        </div>
      </Link>

      <div className="w-full max-w-[560px] my-auto">{children}</div>

      <p className="mt-6 my-auto text-xs text-text-muted font-plus text-center max-w-[400px] leading-relaxed">
        Licensed &amp; bonded raffle operator. 18+ only. Void where prohibited.
      </p>
    </div>
  );
}
