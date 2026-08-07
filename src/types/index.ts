export type RaffleCategory = "Knives" | "Optics" | "Ammo" | "Accessories" | "Firearms";

export interface Raffle {
  id: string;
  category: RaffleCategory;
  title: string;
  seatPrice: number;
  seatsTotal: number;
  seatsClaimed: number;
  urgent: boolean;
}

export interface FeaturedRaffle extends Raffle {
  retailValue: number;
  drawsInLabel: string;
  description: string;
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
