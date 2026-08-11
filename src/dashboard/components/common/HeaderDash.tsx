"use client";

import Link from "next/link";
import { Bell, Menu, Sparkles } from "lucide-react";
import { useGetNotificationsQuery } from "@/lib/api/userApi";
// import { useAutoRefetch } from "@/lib/tanstack/useAutoRefetch";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: "user" | "admin";
  };
  onMenuClick?: () => void;
}

export function HeaderDash({ user, onMenuClick }: HeaderProps) {
  const { data: notificationsData } =
    useGetNotificationsQuery(
      { page: 1, limit: 1 },
      {
        refetchOnFocus: false,
        refetchOnReconnect: false,
      }
    );
  // useAutoRefetch({
  //   queryKey: ["notifications", "badge"],
  //   refetch: refetchNotifications,
  // });
  const unreadCount = notificationsData?.unreadCount ?? 0;
  return (
    <header className="h-16 bg-[#1B0F08] border-b border-[#2E1C0E] flex items-center shrink-0 sticky top-0 z-40 select-none font-plus">
      {/* Mobile Menu Toggle - Below md */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          title="Open menu"
          className="md:hidden h-16 w-16 shrink-0 border-r border-[#2E1C0E] flex items-center justify-center text-[#B08A6C] hover:text-white hover:bg-[#2E1C0E] transition-colors duration-300 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      <div className="flex-1 min-w-0 flex items-center justify-between px-6">
      {/* Welcome Title */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-sm font-medium text-[#B08A6C]">
            Welcome,{" "}
            <span className="text-white font-bold text-base">{user.name}</span>
          </div>
          <span className="text-[11px] text-[#C78C3A] font-semibold">
            {user.role === "admin"
              ? "System Administrator Access"
              : "Ready to reserve your seat?"}
          </span>
        </div>
      </div>

      {/* Right Actions & Icons */}
      <div className="flex items-center gap-4">
        {/* Quick Explorer Pill */}
        <Link
          href={user.role === "admin" ? "/admin/manage-games" : "/dashboard"}
          prefetch={false}
          className="hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-[#100602] border border-[#2E1C0E] text-[#B08A6C] hover:text-white hover:border-[#C78C3A] transition-colors duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C78C3A]" />
          <span>
            {user.role === "admin" ? "Manage Games" : "Explore Games"}
          </span>
        </Link>

        {/* Notifications Icon with Unread Badge - User dashboard only */}
        {user.role === "user" && (
          <Link
            href="/dashboard/notifications"
            prefetch={false}
            className="relative p-2 rounded-lg bg-[#100602] border border-[#2E1C0E] text-[#B08A6C] hover:text-white hover:border-[#C78C3A] transition-colors duration-300"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C78C3A] px-1 text-[9px] font-bold text-[#1a1408] border-2 border-[#1B0F08]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* Divider */}
        <div
          className={`h-6 w-[1px] bg-[#2E1C0E] ${
            user.role === "user" ? "hidden md:block" : ""
          }`}
        />

        {/* User Info & Profile Avatar */}
        <div
          className={`flex items-center gap-3 ${
            user.role === "user" ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-white leading-none">
              {user.name}
            </span>
            <span className="text-[10px] font-semibold text-[#C78C3A] uppercase tracking-wider mt-0.5">
              {user.role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-lg bg-[#C78C3A] border border-[#2E1C0E] flex items-center justify-center font-bold text-[#1a1408] text-sm">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
