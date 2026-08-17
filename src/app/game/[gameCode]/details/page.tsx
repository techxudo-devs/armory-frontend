"use client";

import { use } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  ArrowLeft,
  LogIn,
  UserPlus,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Info,
  CreditCard,
} from "lucide-react";
import { useGetGameByCodeQuery } from "@/lib/api/gamesApi";
import { Header } from "@/landing/layout/Header";

const goldButton =
  "flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-6 py-3 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98]";

export default function GameDetailsPage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode: rawGameCode } = use(params);
  const gameCode = rawGameCode.toUpperCase();
  const { data, isLoading, isError } = useGetGameByCodeQuery(gameCode);

  const game = data?.game;
  const seatMap = data?.seatMap ?? [];
  const availableSeats = seatMap.filter((s) => !s.isReserved).length;
  const reservedSeats = seatMap.filter((s) => s.isReserved).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#C09A76]">
            <Loader2 size={18} className="animate-spin" />
            Loading game details...
          </div>
        ) : isError || !game ? (
          <div className="mx-auto max-w-md rounded-2xl border border-orange-600/30 bg-orange-600/10 p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h1 className="text-xl font-bold text-[#F4EADD]">Game not found</h1>
            <p className="mt-2 text-sm text-[#C09A76]">
              This game link is invalid or the game may have been removed.
            </p>
            <Link
              href="/"
              prefetch={false}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-5 py-2.5 text-sm font-semibold text-[#1a1408] transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C]"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/"
                prefetch={false}
                className="flex items-center gap-1.5 text-sm font-medium text-[#C09A76] transition-colors duration-300 hover:text-[#F4EADD]"
              >
                <ArrowLeft size={16} />
                Home
              </Link>
            </div>

            {/* Prize image */}
            {game.prizeImageUrl && (
              <div className="overflow-hidden rounded-2xl border border-[#3D2715]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={game.prizeImageUrl}
                  alt={game.title}
                  className="h-56 w-full object-cover sm:h-72 md:h-80"
                />
              </div>
            )}

            {/* Game info card */}
            <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    game.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : game.status === "completed"
                        ? "bg-[#D29A45]/10 text-[#E3C49A]"
                        : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {game.status === "active"
                    ? "Open for entries"
                    : game.status === "completed"
                      ? "Completed"
                      : "Ended"}
                </span>
                {game.category && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1 text-xs font-semibold text-[#C09A76]">
                    {game.category}
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-2xl font-bold text-[#F4EADD] sm:text-3xl">
                {game.title}
              </h1>

              {game.description && (
                <p className="mt-3 text-sm leading-relaxed text-[#C09A76]">
                  {game.description}
                </p>
              )}

              {/* Stats row */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#C09A76]">
                    <Trophy size={16} className="text-[#E3C49A]" />
                    Prize
                  </div>
                  <p className="mt-1 font-bold text-[#F4EADD]">{game.prize}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm text-[#C09A76]">
                    <Users size={16} className="text-[#E3C49A]" />
                    Seats
                  </div>
                  <p className="mt-1 font-bold text-[#F4EADD]">
                    {game.reservedSeatsCount}/{game.totalSeats}
                  </p>
                </div>
                <div className="col-span-2 rounded-xl bg-white/[0.03] p-4 sm:col-span-1">
                  <div className="flex items-center gap-2 text-sm text-[#C09A76]">
                    <Info size={16} className="text-[#E3C49A]" />
                    Winners
                  </div>
                  <p className="mt-1 font-bold text-[#F4EADD]">
                    {game.numberOfWinners}
                  </p>
                </div>
              </div>
            </div>

            {/* Seat map preview */}
            {seatMap.length > 0 && (
              <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
                <h2 className="mb-4 text-lg font-bold text-[#F4EADD]">
                  Seat Availability
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {seatMap.map((seat) => (
                    <div
                      key={seat.seatNumber}
                      className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg border text-xs font-bold ${
                        seat.isReserved
                          ? "border-[#3D2715] bg-[#150A06] text-[#5C4633]"
                          : "border-[#D29A45]/40 bg-[#D29A45]/10 text-[#E3C49A]"
                      }`}
                    >
                      {seat.seatNumber}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#C09A76]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded border border-[#D29A45]/40 bg-[#D29A45]/10" />
                    Available ({availableSeats})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-[#150A06]" />
                    Reserved ({reservedSeats})
                  </span>
                </div>
              </div>
            )}

            {/* Rules */}
            {game.rules && (
              <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
                <h2 className="mb-3 text-lg font-bold text-[#F4EADD]">Rules</h2>
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[#C09A76]">
                  {game.rules}
                </p>
              </div>
            )}

            {/* Payment options */}
            <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
              <div className="mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-[#E3C49A]" />
                <h2 className="text-lg font-bold text-[#F4EADD]">Payment Options</h2>
              </div>
              <p className="mb-4 text-sm text-[#C09A76]">
                After reserving your seat, you can pay using any of the following methods:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  { label: "Venmo", href: "https://venmo.com/u/Tommy-Hudson-3" },
                  { label: "PayPal", href: "https://www.paypal.com/paypalme/TommyHudson1974" },
                  { label: "Cash App", href: "https://cash.app/$vhhrott" },
                  {
                    label: "Debit/Credit Card",
                    href: "https://checkout.square.site/merchant/ML3144VNCTC5J/checkout/FDHLXSM6SOCWYZHEE6Q2YQMV",
                  },
                ].map((method) => (
                  <a
                    key={method.label}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-[#3D2715] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-[#E3C49A] transition-colors duration-300 hover:border-[#D29A45]/60 hover:text-white"
                  >
                    {method.label}
                    <ExternalLink size={13} />
                  </a>
                ))}
              </div>
            </div>

            {/* Login / Register CTA */}
            {game.status === "active" && (
              <div className="rounded-2xl border border-[#D29A45]/30 bg-gradient-to-b from-[#D29A45]/10 to-[#D29A45]/5 p-6 text-center shadow-xl shadow-[#D29A45]/10 sm:p-8">
                <h2 className="text-xl font-bold text-[#F4EADD]">
                  Ready to claim your seat?
                </h2>
                <p className="mt-2 text-sm text-[#C09A76]">
                  Log in or create an account to reserve your seat in this game.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <Link
                    href={`/login?next=/game/${gameCode}`}
                    prefetch={false}
                    className={goldButton}
                  >
                    <LogIn size={16} />
                    Log in
                  </Link>
                  <Link
                    href={`/register?next=/game/${gameCode}`}
                    prefetch={false}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D29A45]/60 px-6 py-3 text-sm font-semibold text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45]/10"
                  >
                    <UserPlus size={16} />
                    Create account
                  </Link>
                </div>
              </div>
            )}

            {/* Ended/completed notice */}
            {game.status !== "active" && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-center">
                <Trophy className="mx-auto mb-3 h-10 w-10 text-amber-400" />
                <p className="text-sm font-semibold text-amber-400">
                  This game is {game.status === "completed" ? "completed" : "ended"} and no
                  longer accepting entries.
                </p>
                <Link
                  href="/"
                  prefetch={false}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-5 py-2.5 text-sm font-semibold text-[#1a1408] transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C]"
                >
                  <ArrowLeft size={16} />
                  Browse other raffles
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
