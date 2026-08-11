import { Button } from "@/landing/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#raffles", label: "Live raffles" },
  { href: "#how", label: "How it works" },
  { href: "#category", label: "Categories" },
  { href: "#faq", label: "FAQ" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
      <nav className="max-w-[1300px] mx-auto px-8 h-[78px] flex items-center justify-between">
        <Link href="/" prefetch={false}>
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo.jpeg"
            alt="Metal Tubes & Seeds"
            width={1600}
            height={936}
            className="h-10 w-auto object-contain"
          />
          <div className="font-plus font-bold text-[19px]">
            Metal Tubes <span className="text-brass-light">&amp; Seeds</span>
          </div>
        </div>
        </Link>

        <div className="hidden md:flex gap-9">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-text-secondary font-plus hover:text-text-primary transition-colors duration-300">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/login"
            prefetch={false}
            className="text-sm font-plus text-text-secondary hover:text-text-primary transition-colors duration-300"
          >
            Log in
          </Link>
          <Button href="/register" className="!px-5 !py-3 rounded-lg text-white font-plus hover:scale-97 transition-transform duration-300">
            Register Now
          </Button>
        </div>
      </nav>
    </header>
  );
}
