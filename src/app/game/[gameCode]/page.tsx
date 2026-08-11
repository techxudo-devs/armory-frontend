"use client";

import { useState, use, useRef } from "react";
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
  LayoutDashboard,
  CreditCard,
  ImagePlus,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useGetGameByCodeQuery } from "@/lib/api/gamesApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useReserveSeatsMutation } from "@/lib/api/userApi";
import { getErrorMessage, baseApi } from "@/lib/api/baseApi";
import { usePusherEvents } from "@/lib/pusher/usePusher";
import type { SeatInfo } from "@/lib/api/types";

const seatBase =
  "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer border-2";

function seatClasses(seat: SeatInfo, selected: boolean) {
  if (seat.isMine && seat.status === "pending")
    return `${seatBase} cursor-not-allowed border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/30`
  if (seat.isMine) return `${seatBase} cursor-not-allowed border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30`
  if (seat.isReserved && seat.status === "pending")
    return `${seatBase} cursor-not-allowed border-transparent bg-amber-200/70 text-amber-800/70`
  if (seat.isReserved) return `${seatBase} cursor-not-allowed border-transparent bg-slate-300/30 text-slate-400`
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
  const [reserveSeats, { isLoading: isReserving }] = useReserveSeatsMutation();
  const [selected, setSelected] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const paymentProofRef = useRef<HTMLInputElement>(null);

  const game = data?.game;
  const seatMap = data?.seatMap ?? [];
  const mySeats = data?.userReservedSeats ?? [];
  const pendingSeats = data?.pendingSeats ?? [];

  const dispatch = useDispatch();
  usePusherEvents(game?._id ? `game-${game._id}` : null, ["seat-map:updated"], () => {
    dispatch(baseApi.util.invalidateTags(["Game"]));
  });

  const canSubmitPayment =
    paymentReference.trim().length > 0 || paymentProofFile !== null;

  const handlePaymentProofChange = (file: File | undefined) => {
    setPaymentProofFile(file ?? null);
    setPaymentProofPreview(file ? URL.createObjectURL(file) : null);
  };

  const toggleSeat = (seatNumber: number) => {
    setSelected((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber],
    );
  };

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
    if (!game || selected.length === 0) return;
    if (!canSubmitPayment) {
      toast.error("Please provide a payment reference or upload a payment screenshot.");
      return;
    }
    const seatsToReserve = selected.filter(
      (n) => !mySeats.includes(n) && !pendingSeats.includes(n),
    );
    if (seatsToReserve.length === 0) {
      setConfirming(false);
      setSelected([]);
      toast.info("Those seats are already yours.");
      return;
    }
    try {
      await reserveSeats({
        gameId: game._id,
        seatNumbers: seatsToReserve,
        paymentReference: paymentReference.trim(),
        paymentProof: paymentProofFile ?? undefined,
      }).unwrap();
      toast.success(
        `Seat ${seatsToReserve.map((n) => `#${n}`).join(", ")} submitted. They are now pending admin approval.`,
      );
      setConfirming(false);
      setSelected([]);
      setPaymentReference("");
      setPaymentProofFile(null);
      if (paymentProofPreview) URL.revokeObjectURL(paymentProofPreview);
      setPaymentProofPreview(null);
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
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-700"
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
            className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-slate-800"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={notLoggedIn ? "/login?next=/dashboard" : "/dashboard"}
              prefetch={false}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-300 hover:border-blue-600 hover:text-blue-600"
            >
              <LayoutDashboard size={16} />
              Go to your dashboard
            </Link>
            <button
              onClick={handleShare}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors duration-300 hover:border-blue-600 hover:text-blue-600"
            >
              {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              {copied ? "Link Copied!" : "Share"}
            </button>
          </div>
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

        {/* Seat selection (active only) */}
        {game.status === "active" ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900">
                {(mySeats.length + pendingSeats.length) > 0 ? "Reserve More Seats" : "Choose Your Seats"}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded border-2 border-slate-200 bg-white" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-amber-300" /> Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-slate-300/30" /> Reserved
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3.5 w-3.5 rounded bg-emerald-500" /> My Seat
                </span>
              </div>
            </div>

            {mySeats.length > 0 && (
              <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 size={24} className="text-emerald-500" />
                <p className="text-sm font-bold text-emerald-800">
                  You hold seat{mySeats.length > 1 ? "s" : ""}{" "}
                  {mySeats.map((n) => `#${n}`).join(", ")}
                </p>
                <p className="text-xs text-emerald-600">
                  You can reserve additional seats while they are available.
                </p>
              </div>
            )}

            {pendingSeats.length > 0 && (
              <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
                <Clock size={24} className="text-amber-500" />
                <p className="text-sm font-bold text-amber-800">
                  {pendingSeats.length} seat{pendingSeats.length > 1 ? "s" : ""} awaiting approval:{" "}
                  {pendingSeats.map((n) => `#${n}`).join(", ")}
                </p>
                <p className="text-xs text-amber-600">
                  Your payment is being verified by the admin.
                </p>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
              {seatMap.map((seat) => (
                <button
                  key={seat.seatNumber}
                  disabled={notLoggedIn || seat.isReserved}
                  onClick={() => toggleSeat(seat.seatNumber)}
                  className={seatClasses(seat, selected.includes(seat.seatNumber))}
                >
                  {seat.seatNumber}
                </button>
              ))}
            </div>

            {/* Selection summary + reserve (logged in only) */}
            {!notLoggedIn && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
                <p className="text-sm text-slate-500">
                  {selected.length > 0
                    ? `${selected.length} seat${selected.length > 1 ? "s" : ""} selected (${selected.map((n) => `#${n}`).join(", ")})`
                    : "Click available seats to reserve them"}
                </p>
                <button
                  onClick={() => setConfirming(true)}
                  disabled={selected.length === 0}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {selected.length > 0
                    ? `Reserve ${selected.length} Seat${selected.length > 1 ? "s" : ""}`
                    : "Select seats first"}
                </button>
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
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-700 sm:flex-none"
                  >
                    <LogIn size={16} />
                    Log in
                  </Link>
                  <Link
                    href={`/register?next=/game/${gameCode}`}
                    prefetch={false}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors duration-300 hover:bg-blue-50 sm:flex-none"
                  >
                    <UserPlus size={16} />
                    Create account
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-8 text-center shadow-sm">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800">
              This game is {game.status === "completed" ? "completed" : "ended"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {game.status === "completed"
                ? "The draw has finished and winners have been announced. This game is no longer accepting entries."
                : "This game has ended and is no longer accepting entries."}
            </p>
            <Link
              href="/"
              prefetch={false}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-indigo-700"
            >
              <ArrowLeft size={16} />
              Browse other raffles
            </Link>
          </div>
        )}

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

      {/* Payment popup */}
      {confirming && selected.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-center shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <CreditCard size={26} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Pay Here</h3>
            <p className="mt-1 text-sm text-slate-500">
              Paying for seat{selected.length > 1 ? "s" : ""}{" "}
              {selected.map((n) => `#${n}`).join(", ")}
            </p>

            {/* Send donations */}
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                Pay Here to reserve your seat
              </p>
              <a
                href="https://linktr.ee/metaltubesandseeds"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-1.5 text-sm font-semibold text-blue-600 underline-offset-2 hover:underline"
              >
                https://linktr.ee/metaltubesandseeds
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Payment reference */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <label
                htmlFor="payment-reference"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Transaction / receipt reference <span className="text-red-500">*</span>
              </label>
              <input
                id="payment-reference"
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. PayPal TID or bank receipt ID"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors duration-300 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Payment screenshot */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment screenshot <span className="font-normal normal-case">(or reference)</span>
              </label>
              <input
                ref={paymentProofRef}
                type="file"
                accept="image/*"
                onChange={(e) => handlePaymentProofChange(e.target.files?.[0])}
                className="hidden"
              />
              {paymentProofPreview ? (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paymentProofPreview}
                    alt="Payment proof preview"
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-slate-600">
                      {paymentProofFile?.name}
                    </p>
                    <button
                      onClick={() => {
                        handlePaymentProofChange(undefined);
                        if (paymentProofRef.current) paymentProofRef.current.value = "";
                      }}
                      className="w-fit cursor-pointer rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors duration-300 hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => paymentProofRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-5 text-slate-500 transition-colors duration-300 hover:border-blue-400 hover:text-blue-600"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs font-semibold">Upload payment screenshot</span>
                  <span className="text-[11px] text-slate-400">JPG, PNG up to 5MB</span>
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Make your payment to the account above, then enter the reference or upload the screenshot. The admin will verify it and approve your seats.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false);
                  setSelected([]);
                }}
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                disabled={isReserving || !canSubmitPayment}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReserving && <Loader2 size={15} className="animate-spin" />}
                {isReserving ? "Submitting..." : "Pay & Submit"}
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
