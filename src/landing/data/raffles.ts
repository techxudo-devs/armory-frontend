import type { FeaturedRaffle, Raffle } from "@/types";

export const featuredRaffle: FeaturedRaffle = {
  id: "featured-rifle-build",
  category: "Firearms",
  title: "Competition-Grade Rifle Build, Full Cerakote Finish",
  description:
    "Hand-built by our in-house armorer, this is the single most-claimed listing on Metal Tubes & Seeds this quarter.",
  seatsTotal: 320,
  seatsClaimed: 312,
  urgent: true,
};

export const raffles: Raffle[] = [
  {
    id: "field-knife-damascus",
    category: "Knives",
    title: "Custom Field Knife, Walnut & Damascus",
    seatsTotal: 30,
    seatsClaimed: 28,
    urgent: true
  },
  {
    id: "osight-reflex",
    category: "Optics",
    title: "Enclosed Reflex Red Dot, Multi-Reticle",
    seatsTotal: 35,
    seatsClaimed: 21,
    urgent: false
  },
  {
    id: "ammo-556-200",
    category: "Ammo",
    title: "200 Rounds, 5.56 NATO 55gr FMJ",
    seatsTotal: 32,
    seatsClaimed: 13,
    urgent: false
  },
  {
    id: "tactical-sling",
    category: "Accessories",
    title: "Tactical Sling, Quick-Adjust Low-Profile",
    seatsTotal: 32,
    seatsClaimed: 6,
    urgent: false
  },
  {
    id: "nv-monocular",
    category: "Optics",
    title: "Gen 3 Night Vision Monocular Kit",
    seatsTotal: 30,
    seatsClaimed: 8,
    urgent: false
  },
  {
    id: "titanium-folder",
    category: "Knives",
    title: "Titanium Frame-Lock Folder, S35VN Steel",
    seatsTotal: 30,
    seatsClaimed: 27,
    urgent: true
  }
];
