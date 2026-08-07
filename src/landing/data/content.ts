import type { Category, FaqEntry, Testimonial, Winner } from "@/types";

export const categories: Category[] = [
  { id: "knives", name: "Knives", description: "Field, EDC & collector blades", liveCount: 14 },
  { id: "optics", name: "Optics", description: "Red dots, scopes & NV", liveCount: 9 },
  { id: "ammo", name: "Ammo", description: "Bulk cases, all calibers", liveCount: 7 },
  { id: "accessories", name: "Accessories", description: "Slings, cases & carry gear", liveCount: 8 }
];

export const winners: Winner[] = [
  { id: "w1", initials: "JR", name: "J. Ramos", location: "Austin, TX", item: "Damascus Field Knife" },
  { id: "w2", initials: "MK", name: "M. Kowalski", location: "Tampa, FL", item: "Osight Reflex Red Dot" },
  { id: "w3", initials: "DP", name: "D. Patel", location: "Reno, NV", item: "Cerakote Rifle Build" },
  { id: "w4", initials: "SC", name: "S. Chen", location: "Boise, ID", item: "500rd Ammo Case" },
  { id: "w5", initials: "TW", name: "T. Walsh", location: "Tulsa, OK", item: "Titanium Folder" }
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    initials: "MK",
    name: "M. Kowalski",
    location: "Tampa, FL",
    quote:
      "Won a red dot on my third seat ever. The draw was streamed live so I actually watched my name come up, no way this was rigged."
  },
  {
    id: "t2",
    initials: "DP",
    name: "D. Patel",
    location: "Reno, NV",
    quote: "Shipping was actually 2 days like they said. Packaging was serious, better than most retail orders I've had."
  },
  {
    id: "t3",
    initials: "TW",
    name: "T. Walsh",
    location: "Tulsa, OK",
    quote:
      "I track the gauge before I buy in, the transparency around seats remaining is what keeps me coming back weekly."
  }
];

export const faqEntries: FaqEntry[] = [
  {
    id: "f1",
    question: "How does the seat-based draw work?",
    answer:
      "Each listing has a fixed number of seats. Once every seat sells, we run a live, recorded random draw and one seat holder wins the featured item."
  },
  {
    id: "f2",
    question: "What if a raffle doesn't sell out?",
    answer:
      "Draws only happen once all seats are claimed. If a listing is pulled before selling out, every seat holder is refunded in full, automatically."
  },
  {
    id: "f3",
    question: "Can I buy more than one seat?",
    answer: "Yes, each seat you hold is a separate entry, so buying more seats improves your odds proportionally."
  },
  {
    id: "f4",
    question: "How fast does gear ship after a win?",
    answer:
      "Winners are contacted within the hour and gear ships within 48 hours, tracking included. Firearms transfer through a licensed FFL dealer near you."
  }
];
