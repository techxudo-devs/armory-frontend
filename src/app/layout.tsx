import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plusjakarta",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Ironline — Premium Gear Raffles",
  description: "Seat-based raffles for knives, optics, ammo, and accessories. Claim a seat, watch the draw live."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-plus">
        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
