"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/lib/api/authApi";
import {
  Gamepad2,
  Trophy,
  Ticket,
  Users,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  History,
  Archive,
  X,
} from "lucide-react";

interface SidebarUser {
  name: string;
  email: string;
  role: "user" | "admin";
}

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Games", href: "/admin/manage-games", icon: Gamepad2 },
  { label: "Ended Games", href: "/admin/ended-games", icon: Archive },
  {
    label: "Create Game",
    href: "/admin/create-game",
    icon: PlusCircle,
  },
  { label: "Game History", href: "/admin/game-history", icon: History },
  { label: "Manage Users", href: "/admin/manage-users", icon: Users },
];

const userLinks = [
  { label: "Active Games", href: "/dashboard", icon: Gamepad2 },
  { label: "My Seats", href: "/dashboard/my-seats", icon: Ticket },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "My Profile", href: "/dashboard/my-profile", icon: User },
];

function SidebarContent({
  user,
  compact = false,
  onNavigate,
  onClose,
}: {
  user: SidebarUser;
  compact?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();

  const handleSignOut = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      console.error("Logout error", error);
    }
    router.push("/login");
  };

  const links = user.role === "admin" ? adminLinks : userLinks;

  const headerWrap = compact
    ? "px-3 lg:px-5 justify-center lg:justify-start"
    : "px-5 justify-start";
  const brandText = compact ? "hidden lg:flex" : "flex";
  const panel = compact ? "hidden lg:block" : "block";
  const navPad = compact ? "p-3 lg:p-4" : "p-4";
  const linkWrap = compact
    ? "justify-center lg:justify-start px-3 lg:px-3.5"
    : "justify-start px-3.5";
  const linkLabel = compact ? "hidden lg:inline" : "inline";
  const userRow = compact ? "justify-center lg:justify-between" : "justify-between";
  const userName = compact ? "hidden lg:flex" : "flex";
  const signOutText = compact ? "hidden lg:inline" : "inline";
  const bottomPad = compact ? "p-1.5 md:p-3 lg:p-4" : "p-4";

  return (
    <div className="flex flex-col h-full justify-between select-none font-plus">
      <div>
        {/* Top-Left Logo & Project Name */}
        <div
          className={`h-16 border-b border-[#1F293D] flex items-center gap-3 ${
            onClose ? "px-5 justify-between" : headerWrap
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-[#6667DD] flex items-center justify-center text-white shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div className={`flex-col ${brandText}`}>
              <span className="font-bold text-base text-white tracking-wide leading-tight">
                LuckySeat
              </span>
              <span className="text-[10px] text-[#94A3B8] font-medium tracking-widest uppercase">
                Game Platform
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              title="Close menu"
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1F293D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Panel Context Indicator */}
        <div
          className={`${panel} px-5 py-2.5 border-b border-[#1F293D] bg-[#0B101D]/40`}
        >
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
            {user.role === "admin" ? "ADMIN CONTROL PANEL" : "PLAYER DASHBOARD"}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className={`space-y-1.5 ${navPad}`}>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${linkWrap} ${
                  isActive
                    ? "bg-[#6667DD] text-white font-semibold"
                    : "text-[#94A3B8] hover:bg-[#1F293D] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={`truncate ${linkLabel}`}>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar: User Details & Sign Out Button */}
      <div
        className={`border-t border-[#1F293D] bg-[#0E1525] ${bottomPad}`}
      >
        <div className={`flex items-center gap-2 mb-3 px-1 ${userRow}`}>
          <div className={`flex-col min-w-0 ${userName}`}>
            <span className="text-xs font-semibold text-white truncate">
              {user.name}
            </span>
            <span className="text-[11px] text-[#94A3B8] truncate">
              {user.email}
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#0B101D] border border-[#1F293D] text-[#6667DD]">
            {user.role}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className={signOutText}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

export function SidebarDash({ user }: { user: SidebarUser }) {
  return (
    <aside className="hidden md:flex w-[15%] md:w-[10%] lg:w-1/5 h-screen sticky top-0 bg-[#131B2E] border-r border-[#1F293D] flex-col shrink-0 overflow-hidden">
      <SidebarContent user={user} compact />
    </aside>
  );
}

export function MobileSidebar({
  user,
  open,
  onClose,
}: {
  user: SidebarUser;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] z-50 bg-[#131B2E] border-r border-[#1F293D] overflow-y-auto transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent user={user} onNavigate={onClose} onClose={onClose} />
      </aside>
    </>
  );
}
