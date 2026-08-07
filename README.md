# Ironline — Landing Page

Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Setup

```
npm install
npm run dev
```

Open http://localhost:3000

## Structure

```
src/
  app/
    layout.tsx        Root layout, font loading, metadata
    page.tsx           Composes all sections into the landing page
    globals.css         Tailwind entry + base styles

  components/
    layout/            Header, Footer — persistent chrome
    sections/           One component per landing page section
                         (Hero, FeaturedSpotlight, CategoryGrid,
                         RaffleGrid, WinnersTicker, HowItWorks,
                         Testimonials, FAQ, CTABanner)
    ui/                 Reusable primitives with no page-specific
                         logic — Button, Pill, Eyebrow, SeatGauge,
                         RaffleCard, CategoryIcon

  data/                 Mock content, separate from components.
                         Swap for API/CMS calls without touching UI.

  types/                Shared TypeScript interfaces (Raffle,
                         Winner, Testimonial, FaqEntry, Category)

  lib/                  Pure helper functions (formatCurrency,
                         seatGaugeSegments, seatsRemaining)
```

## Notes

- `RaffleCard` and `SeatGauge` are the two components most worth
  pulling into a shared `packages/ui` if this becomes a monorepo
  alongside a dashboard app — both are used identically here and
  would be reused there.
- Data currently lives in `src/data/*.ts` as static arrays. Replace
  with fetch calls (e.g. in `page.tsx` as a server component) once
  the backend API is ready — the component props are already typed
  against the same interfaces the API should return.
- `RaffleGrid` and `FAQ` are the only client components (`"use
  client"`), since they hold interactive state (filter selection,
  accordion open/close). Everything else renders as a server
  component by default.
