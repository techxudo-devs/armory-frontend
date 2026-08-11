export type RaffleCategory = "Knives" | "Optics" | "Ammo" | "Accessories" | "Firearms";

export const RAFFLE_CATEGORIES: RaffleCategory[] = [
  "Knives",
  "Optics",
  "Ammo",
  "Accessories",
  "Firearms",
];

export interface Raffle {
  id: string;
  gameCode?: string;
  category: RaffleCategory;
  title: string;
  seatsTotal: number;
  seatsClaimed: number;
  urgent: boolean;
  imageUrl?: string;
  endDate?: string | null;
}

export interface FeaturedRaffle extends Raffle {
  description?: string;
}

export interface Winner {
  id: string;
  initials: string;
  name: string;
  location: string;
  item: string;
}

export interface Testimonial {
  id: string;
  initials: string;
  name: string;
  location: string;
  quote: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface Category {
  id: string;
  name: RaffleCategory;
  description: string;
  liveCount: number;
}
