"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useLogoutMutation } from "@/lib/api/authApi";
import { useGetPendingApprovalsQuery } from "@/lib/api/gamesApi";
import {
  Gamepad2,
  Ticket,
  Users,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  History,
  Archive,
  BadgeCheck,
  X,
} from "lucide-react";

interface SidebarUser {
  name: string;
  email: string;
  role: "user" | "admin";
}

interface SidebarLink {
  label: string;
  href: string;
  icon: typeof Gamepad2;
  showCount?: boolean;
}

const adminLinks: SidebarLink[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Games", href: "/admin/manage-games", icon: Gamepad2 },
  {
    label: "Seat Approvals",
    href: "/admin/approvals",
    icon: BadgeCheck,
    showCount: true,
  },
  { label: "Ended Games", href: "/admin/ended-games", icon: Archive },
  {
    label: "Create Game",
    href: "/admin/create-game",
    icon: PlusCircle,
  },
  { label: "Game History", href: "/admin/game-history", icon: History },
  { label: "Manage Users", href: "/admin/manage-users", icon: Users },
];

const userLinks: SidebarLink[] = [
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

  const { data: pendingApprovals } = useGetPendingApprovalsQuery(undefined, {
    skip: user.role !== "admin",
  });
  const pendingCount = pendingApprovals?.length ?? 0;

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
          className={`h-16 border-b border-[#2E1C0E] flex items-center gap-3 ${
            onClose ? "px-5 justify-between" : headerWrap
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/images/logo.jpeg"
              alt="Metal Tubes & Seeds"
              width={1600}
              height={936}
              className="h-8 w-auto shrink-0 object-contain lg:h-10"
            />
            <div className={`flex-col ${brandText}`}>
              <span className="font-bold text-base text-white tracking-wide leading-tight">
                Metal Tubes
              </span>
              <span className="text-[10px] text-[#B08A6C] font-medium tracking-widest uppercase">
                Game Platform
              </span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              title="Close menu"
              className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[#B08A6C] hover:text-white hover:bg-[#2E1C0E] transition-colors duration-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Panel Context Indicator */}
        <div
          className={`${panel} px-5 py-2.5 border-b border-[#2E1C0E] bg-[#100602]/40`}
        >
          <span className="text-[10px] font-bold text-[#B08A6C] uppercase tracking-wider">
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
                prefetch={false}
                title={link.label}
                onClick={() => onNavigate?.()}
                className={`flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-300 ${linkWrap} ${
                  isActive
                    ? "bg-[#C78C3A] text-[#1a1408] font-semibold"
                    : "text-[#B08A6C] hover:bg-[#2E1C0E] hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={`truncate ${linkLabel}`}>{link.label}</span>
                {link.showCount && pendingCount > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/20 px-1.5 text-[10px] font-bold text-amber-400">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sidebar: User Details & Sign Out Button */}
      <div
        className={`border-t border-[#2E1C0E] bg-[#160B05] ${bottomPad}`}
      >
        <div className={`flex items-center gap-2 mb-3 px-1 ${userRow}`}>
          <div className={`flex-col min-w-0 ${userName}`}>
            <span className="text-xs font-semibold text-white truncate">
              {user.name}
            </span>
            <span className="text-[11px] text-[#B08A6C] truncate">
              {user.email}
            </span>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-[#100602] border border-[#2E1C0E] text-[#C78C3A]">
            {user.role}
          </span>
        </div>

        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-amber-500 bg-orange-600/10 border border-orange-600/20 hover:bg-orange-600 hover:text-white transition-colors duration-300 cursor-pointer"
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
    <aside className="hidden md:flex w-[15%] md:w-[10%] lg:w-1/5 h-screen sticky top-0 bg-[#1B0F08] border-r border-[#2E1C0E] flex-col shrink-0 overflow-y-auto">
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
        className={`md:hidden fixed top-0 left-0 bottom-0 w-4/5 max-w-[320px] z-50 bg-[#1B0F08] border-r border-[#2E1C0E] overflow-y-auto transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent user={user} onNavigate={onClose} onClose={onClose} />
      </aside>
    </>
  );
}
