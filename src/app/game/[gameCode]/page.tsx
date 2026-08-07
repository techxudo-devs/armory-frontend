"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Clock,
  Share2,
  Loader2,
  CheckCircle2,
  Lock,
  AlertTriangle,
  ArrowLeft,
  LogIn,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useGetGameByCodeQuery } from "@/lib/api/gamesApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useReserveSeatMutation } from "@/lib/api/userApi";
import { getErrorMessage } from "@/lib/api/baseApi";

const seatBase =
  "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg text-sm font-bold transition-all cursor-pointer border-2";

function seatClasses(seat: { isReserved: boolean; isMine: boolean }, selected: boolean) {
  if (seat.isMine) return `${seatBase} border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30`
  if (seat.isReserved) return `${seatBase} border-transparent bg-slate-300/30 text-slate-400 cursor-not-allowed`
  if (selected) return `${seatBase} border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30`
  return `${seatBase} border-slate-200 bg-white text-slate-800 hover:border-blue-600 hover:text-blue-600`
}

export default function PublicGamePage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode: rawGameCode } = use(params);
  const gameCode = rawGameCode.toUpperCase();
  const { data, isLoading, isError } = useGetGameByCodeQuery(gameCode);
  const { isError: notLoggedIn } = useGetMeQuery();
  const [reserveSeat, { isLoading: isReserving }] = useReserveSeatMutation();
  const [selected, setSelected] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  const game = data?.game;
  const seatMap = data?.seatMap ?? [];
  const mySeat = data?.userReservedSeat ?? null;

  const handleShare = async () => {
    const link = `${window.location.origin}/game/${gameCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Game link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleConfirmReserve = async () => {
    if (!game || selected === null) return;
    try {
      await reserveSeat({ gameId: game._id, seatNumber: selected }).unwrap();
      toast.success(`Seat #${selected} reserved successfully! Good luck!`);
      setConfirming(false);
      setSelected(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm">Loading game...</p>
        </div>
      </Shell>
    );
  }

  if (isError || !game) {
    return (
      <Shell>
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold text-slate-800">Game not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This game link is invalid or the game may have been removed.
          </p>
          <Link
            href="/"
            prefetch={false}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            prefetch={false}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
          <button
            onClick={handleShare}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-blue-600 hover:text-blue-600"
          >
            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            {copied ? "Link Copied!" : "Share"}
          </button>
        </div>

        {/* Game info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  game.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : game.status === "completed"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-amber-100 text-amber-700"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {game.status === "active"
                  ? "Open for entries"
                  : game.status === "completed"
                    ? "Completed"
                    : "Ended"}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{game.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {game.description || "Join this lucky draw by reserving your seat."}
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm">
                <Trophy size={16} className="text-amber-500" />
                <span className="text-slate-500">Prize</span>
                <span className="font-bold text-slate-900">{game.prize}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users size={16} className="text-blue-600" />
                <span className="text-slate-500">Seats filled</span>
                <span className="font-bold text-slate-900">
                  {game.reservedSeatsCount}/{game.totalSeats}
                </span>
              </div>
              {game.endDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-slate-400" />
                  <span className="text-slate-500">Ends</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(game.endDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seat selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {mySeat ? `Your Seat #${mySeat}` : "Choose Your Seat"}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded border-2 border-slate-200 bg-white" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-slate-300/30" /> Reserved
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded bg-emerald-500" /> My Seat
              </span>
            </div>
          </div>

          {mySeat ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 size={28} className="text-emerald-500" />
              <p className="font-bold text-emerald-800">
                Seat #{mySeat} has been reserved successfully!
              </p>
              <p className="text-sm text-emerald-600">
                You can reserve only one seat per game. Good luck!
              </p>
            </div>
          ) : !notLoggedIn ? (
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {seatMap.map((seat) => (
                <button
                  key={seat.seatNumber}
                  disabled={seat.isReserved}
                  onClick={() => {
                    setSelected(seat.seatNumber);
                    setConfirming(true);
                  }}
                  className={seatClasses(seat, selected === seat.seatNumber)}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {seatMap.map((seat) => (
                <button
                  key={seat.seatNumber}
                  disabled
                  className={seatClasses(seat, false)}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>
          )}

          {/* Auth CTA */}
          {notLoggedIn && (
            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
              <Lock className="mx-auto mb-2 h-6 w-6 text-blue-600" />
              <p className="text-sm font-semibold text-slate-800">
                Log in to reserve your seat in this game
              </p>
              <p className="mt-1 text-xs text-slate-500">
                New here? Creating an account takes less than a minute.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                <Link
                  href={`/login?next=/game/${gameCode}`}
                  prefetch={false}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:flex-none"
                >
                  <LogIn size={16} />
                  Log in
                </Link>
                <Link
                  href={`/register?next=/game/${gameCode}`}
                  prefetch={false}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 sm:flex-none"
                >
                  <UserPlus size={16} />
                  Create account
                </Link>
              </div>
            </div>
          )}

          {!mySeat && !notLoggedIn && game.status !== "active" && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
              <p className="text-sm font-semibold text-amber-800">
                This game is {game.status === "completed" ? "completed" : "ended"} and no longer
                accepting entries.
              </p>
            </div>
          )}
        </div>

        {/* Rules */}
        {game.rules ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-slate-900">Rules</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {game.rules}
            </p>
          </div>
        ) : null}
      </div>

      {/* Confirm popup */}
      {confirming && selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Trophy size={26} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Seat #{selected}</h3>
            <p className="mt-2 text-sm text-slate-500">Do you want to reserve this seat?</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false);
                  setSelected(null);
                }}
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                disabled={isReserving}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReserving && <Loader2 size={15} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">{children}</div>
    </div>
  );
}
