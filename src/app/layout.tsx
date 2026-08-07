import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Oswald, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"]
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  weight: ["400", "500", "700"]
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plusjakarta",
  weight: ["400", "500", "600", "700", "800"]
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Ironline — Premium Gear Raffles",
  description: "Seat-based raffles for knives, optics, ammo, and accessories. Claim a seat, watch the draw live."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${poppins.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <Toaster richColors position="bottom-right" closeButton />
      </body>
    </html>
  );
}
