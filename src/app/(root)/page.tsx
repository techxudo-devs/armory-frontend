import { Header } from "@/landing/layout/Header";
import { Footer } from "@/landing/layout/Footer";
import { FeaturedSpotlight } from "@/landing/components/sections/FeaturedSpotlight";
import { CategoryGrid } from "@/landing/components/sections/CategoryGrid";
import { RaffleGrid } from "@/landing/components/sections/RaffleGrid";
import { HowItWorks } from "@/landing/components/sections/HowItWorks";
import { FAQ } from "@/landing/components/sections/FAQ";
import { Hero2 } from "@/landing/components/sections/Hero2";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero2 />
        <FeaturedSpotlight />
        {/* <CategoryGrid /> */}
        <RaffleGrid />
        {/* <WinnersTicker /> */}
        <HowItWorks />
        {/* <Testimonials /> */}
        <FAQ />
        {/* <CTABanner /> */}
      </main>
      <Footer />
    </>
  );
}
