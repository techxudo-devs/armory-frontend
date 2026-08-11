import type { FeaturedRaffle, Raffle } from "@/types";

export const featuredRaffle: FeaturedRaffle = {
  id: "featured-rifle-build",
  category: "Firearms",
  title: "Competition-Grade Rifle Build, Full Cerakote Finish",
  description:
    "Hand-built by our in-house armorer, this is the single most-claimed listing on Metal Tubes & Seeds this quarter, retail value verified at $3,200, yours for the price of a seat.",
  seatPrice: 15,
  seatsTotal: 320,
  seatsClaimed: 312,
  urgent: true,
  retailValue: 3200,
  drawsInLabel: "2d 14h"
};

export const raffles: Raffle[] = [
  {
    id: "field-knife-damascus",
    category: "Knives",
    title: "Custom Field Knife, Walnut & Damascus",
    seatPrice: 10,
    seatsTotal: 30,
    seatsClaimed: 28,
    urgent: true
  },
  {
    id: "osight-reflex",
    category: "Optics",
    title: "Enclosed Reflex Red Dot, Multi-Reticle",
    seatPrice: 10,
    seatsTotal: 35,
    seatsClaimed: 21,
    urgent: false
  },
  {
    id: "ammo-556-200",
    category: "Ammo",
    title: "200 Rounds, 5.56 NATO 55gr FMJ",
    seatPrice: 10,
    seatsTotal: 32,
    seatsClaimed: 13,
    urgent: false
  },
  {
    id: "tactical-sling",
    category: "Accessories",
    title: "Tactical Sling, Quick-Adjust Low-Profile",
    seatPrice: 5,
    seatsTotal: 32,
    seatsClaimed: 6,
    urgent: false
  },
  {
    id: "nv-monocular",
    category: "Optics",
    title: "Gen 3 Night Vision Monocular Kit",
    seatPrice: 12,
    seatsTotal: 30,
    seatsClaimed: 8,
    urgent: false
  },
  {
    id: "titanium-folder",
    category: "Knives",
    title: "Titanium Frame-Lock Folder, S35VN Steel",
    seatPrice: 8,
    seatsTotal: 30,
    seatsClaimed: 27,
    urgent: true
  }
];
