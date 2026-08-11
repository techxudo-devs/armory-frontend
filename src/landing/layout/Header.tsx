"use client";

import { Button } from "@/landing/components/ui/Button";
import { HelpCircle, LayoutGrid, LogIn, Menu, PlayCircle, Ticket, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "#raffles", label: "Live raffles", icon: Ticket },
  { href: "#how", label: "How it works", icon: PlayCircle },
  { href: "#category", label: "Categories", icon: LayoutGrid },
  { href: "#faq", label: "FAQ", icon: HelpCircle }
];

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur-md">
        <nav className="max-w-[1300px] mx-auto px-4 sm:px-8 h-[78px] flex items-center justify-between">
          <Link href="/" prefetch={false}>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo.jpeg"
                alt="Metal Tubes & Seeds"
                width={1600}
                height={936}
                className="h-8 w-auto object-contain sm:h-10"
              />
              <div className="font-plus font-bold text-[15px] sm:text-[19px]">
                Metal Tubes <span className="text-brass-light">&amp; Seeds</span>
              </div>
            </div>
          </Link>

          <div className="hidden lg:flex gap-9">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-text-secondary font-plus hover:text-text-primary transition-colors duration-300">
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-5">
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

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="lg:hidden flex h-11 w-11 items-center justify-center rounded-lg border border-border-strong text-brass-light hover:bg-panel-2 transition-colors duration-300 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {/* Overlay behind the sidebar */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[80%] max-w-[400px] bg-panel border-l border-border-strong flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/logo.jpeg"
              alt="Metal Tubes & Seeds"
              width={1600}
              height={936}
              className="h-9 w-auto object-contain"
            />
            <div className="font-plus font-bold text-[15px]">
              Metal Tubes
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-strong text-brass-light hover:bg-panel-2 transition-colors duration-300 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg pr-4 py-3 text-base font-plus text-text-secondary hover:bg-panel-2 hover:text-text-primary transition-colors duration-300"
              >
                <Icon className="h-5 w-5 flex-shrink-0 text-brass-light" strokeWidth={1.75} />
                {link.label}
              </a>
            );
          })}
          <Link
            href="/login"
            prefetch={false}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg pr-4 py-3 text-base font-plus text-text-secondary hover:bg-panel-2 hover:text-text-primary transition-colors duration-300"
          >
            <LogIn className="h-5 w-5 flex-shrink-0 text-brass-light" strokeWidth={1.75} />
            Log in
          </Link>
        </nav>

        <div className="border-t border-border px-5 py-5">
          <Button
            href="/register"
            onClick={() => setOpen(false)}
            className="w-full !px-5 !py-3 rounded-lg text-white font-plus"
          >
            Register Now
          </Button>
        </div>
      </aside>
    </>
  );
}
