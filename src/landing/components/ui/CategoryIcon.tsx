import Image from "next/image";
import { Crosshair, Feather, Package, Zap } from "lucide-react";
import type { RaffleCategory } from "@/types";

interface CategoryIconProps {
  category: RaffleCategory;
  className?: string;
}

const iconByCategory: Record<RaffleCategory, typeof Crosshair> = {
  Knives: Feather,
  Optics: Crosshair,
  Ammo: Package,
  Accessories: Zap,
  Firearms: Crosshair,
};

export function CategoryIcon({
  category,
  className = "w-8 h-8",
}: CategoryIconProps) {
  const Icon = iconByCategory[category];
  return <Icon className={className} strokeWidth={1.5} />;
}

interface CategoryImageProps {
  category: RaffleCategory;
  className?: string;
}

const imageByCategory: Record<
  RaffleCategory,
  { src: string; alt: string }
> = {
  Knives: {
    src: "https://images.unsplash.com/photo-1579232308946-36e64f99016b?auto=format&fit=crop&w=2000&q=100",
    alt: "Knives",
  },
  Optics: {
    src: "https://images.unsplash.com/photo-1713643562457-d958596c7022?auto=format&fit=crop&w=2000&q=100",
    alt: "Optics",
  },
  Ammo: {
    src: "https://images.unsplash.com/photo-1551485913-b5dbedb723bb?auto=format&fit=crop&w=2000&q=100",
    alt: "Ammo",
  },
  Accessories: {
    src: "https://images.unsplash.com/photo-1580865767741-37cd59206d74?auto=format&fit=crop&w=2000&q=100",
    alt: "Accessories",
  },
  Firearms: {
    src: "https://images.unsplash.com/photo-1521727215876-9bfe173be82f?auto=format&fit=crop&w=2000&q=100",
    alt: "Firearms",
  },
};

export function CategoryImage({
  category,
  className = "w-full h-full",
}: CategoryImageProps) {
  const { src, alt } = imageByCategory[category];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
