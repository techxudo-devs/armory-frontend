"use client";

import { useEffect, useState, use, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  X,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { useGetGameByCodeQuery } from "@/lib/api/gamesApi";
import { useGetMeQuery } from "@/lib/api/authApi";
import { useReserveSeatsMutation } from "@/lib/api/userApi";
import { getErrorMessage, baseApi } from "@/lib/api/baseApi";
import { usePusherEvents } from "@/lib/pusher/usePusher";
import { Header } from "@/landing/layout/Header";
import type { SeatInfo } from "@/lib/api/types";

const seatBase =
  "flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg border text-sm font-bold transition-all duration-300 cursor-pointer";

function seatClasses(seat: SeatInfo, selected: boolean) {
  if (seat.isMine && seat.status === "pending")
    return `${seatBase} cursor-not-allowed border-[#D08A5A]/60 bg-amber-500/15 text-amber-400`
  if (seat.isMine) return `${seatBase} cursor-not-allowed border-[#8FAD7A]/60 bg-emerald-500/10 text-emerald-400`
  if (seat.isReserved && seat.status === "pending")
    return `${seatBase} cursor-not-allowed border-[#3D2715] bg-amber-500/10 text-amber-600/60`
  if (seat.isReserved) return `${seatBase} cursor-not-allowed border-[#3D2715] bg-[#150A06] text-[#5C4633]`
  if (selected) return `${seatBase} border-[#E3C49A] bg-[#D29A45]/20 text-white ring-2 ring-[#D29A45]/40`
  return `${seatBase} border-[#3D2715] bg-white/[0.03] text-[#C09A76] hover:border-[#D29A45]/60 hover:text-white`
}

const goldButton =
  "flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-5 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50";

export default function PublicGamePage({
  params,
}: {
  params: Promise<{ gameCode: string }>;
}) {
  const { gameCode: rawGameCode } = use(params);
  const router = useRouter();
  const gameCode = rawGameCode.toUpperCase();
  const { data, isLoading, isError } = useGetGameByCodeQuery(gameCode);
  const { data: user, isError: notLoggedIn } = useGetMeQuery();
  const [reserveSeats, { isLoading: isReserving }] = useReserveSeatsMutation();
  const [selected, setSelected] = useState<number[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const paymentProofRef = useRef<HTMLInputElement>(null);
  const seatCardRef = useRef<HTMLDivElement>(null);
  const rulesCardRef = useRef<HTMLDivElement>(null);

  const game = data?.game;
  const seatMap = data?.seatMap ?? [];
  const mySeats = data?.userReservedSeats ?? [];
  const pendingSeats = data?.pendingSeats ?? [];
  const hasSeats = mySeats.length + pendingSeats.length > 0;
  const isAdmin = user?.role === "admin";

  const dispatch = useDispatch();
  usePusherEvents(game?._id ? `game-${game._id}` : null, ["seat-map:updated"], () => {
    dispatch(baseApi.util.invalidateTags(["Game"]));
  });

  useEffect(() => {
    if (!isAdmin) return;
    toast.error("Admins cannot join games. Redirecting to admin dashboard.");
    router.replace("/admin");
  }, [isAdmin, router]);

  useLayoutEffect(() => {
    const seatCard = seatCardRef.current;
    const rulesCard = rulesCardRef.current;
    if (!seatCard || !rulesCard) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (mq.matches && seatCard.offsetHeight > 0) {
        rulesCard.style.height = `${seatCard.offsetHeight}px`;
        rulesCard.style.overflowY = "auto";
      } else {
        rulesCard.style.height = "";
        rulesCard.style.overflowY = "";
      }
    };
    sync();
    mq.addEventListener("change", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(seatCard);
    return () => {
      mq.removeEventListener("change", sync);
      ro.disconnect();
    };
  }, [game?.rules, mySeats.length, pendingSeats.length]);

  const canSubmitPayment =
    paymentReference.trim().length > 0 || paymentProofFile !== null;

  const handlePaymentProofChange = (file: File | undefined) => {
    setPaymentProofFile(file ?? null);
    setPaymentProofPreview(file ? URL.createObjectURL(file) : null);
  };

  const toggleSeat = (seatNumber: number) => {
    if (hasSeats) return;
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#C09A76]">
            <Loader2 size={18} className="animate-spin" />
            Loading game...
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
              <div className="flex items-center gap-2">
                <Link
                  href={notLoggedIn ? "/login?next=/dashboard/active-games" : isAdmin ? "/admin" : "/dashboard/active-games"}
                  prefetch={false}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#3D2715] bg-white/[0.03] px-4 py-2 text-sm font-semibold text-[#E3C49A] transition-colors duration-300 hover:border-[#D29A45]/60 hover:text-white"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={handleShare}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#3D2715] bg-white/[0.03] px-4 py-2 text-sm font-semibold text-[#E3C49A] transition-colors duration-300 hover:border-[#D29A45]/60 hover:text-white"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                  {copied ? "Link Copied!" : "Share"}
                </button>
              </div>
            </div>

            {/* Game info */}
            <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
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
                    {mySeats.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D29A45]/10 px-3 py-1 text-xs font-semibold text-[#E3C49A]">
                        <CheckCircle2 size={12} />
                        You hold seat{mySeats.length > 1 ? "s" : ""}{" "}
                        {mySeats.map((n) => `#${n}`).join(", ")}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-2xl font-bold text-[#F4EADD] sm:text-3xl">{game.title}</h1>
                  <p className="mt-1 text-sm text-[#C09A76]">
                    {game.description || "Join this lucky draw by reserving your seat."}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 rounded-xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy size={16} className="text-[#E3C49A]" />
                    <span className="text-[#C09A76]">Prize</span>
                    <span className="font-bold text-[#F4EADD]">{game.prize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-[#E3C49A]" />
                    <span className="text-[#C09A76]">Seats filled</span>
                    <span className="font-bold text-[#F4EADD]">
                      {game.reservedSeatsCount}/{game.totalSeats}
                    </span>
                  </div>
                  {game.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-[#8FAD7A]" />
                      <span className="text-[#C09A76]">Ends</span>
                      <span className="font-semibold text-[#F4EADD]">
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

            <div
              className={
                game.rules
                  ? "grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(280px,2fr)]"
                  : "grid grid-cols-1 gap-6"
              }
            >
              {/* Seat selection (active only) */}
              <div
                ref={seatCardRef}
                className="min-w-0 rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-[#F4EADD]">
                    {hasSeats ? "Your Seats" : "Choose Your Seats"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#C09A76]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded border border-[#3D2715] bg-white/[0.03]" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-amber-500/30" /> Pending
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-[#150A06]" /> Reserved
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 rounded bg-emerald-500/40" /> My Seat
                    </span>
                  </div>
                </div>

                {game.status !== "active" ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
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
                ) : (
                  <>
                    {mySeats.length > 0 && (
                      <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#8FAD7A]/30 bg-emerald-500/10 p-4 text-center">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                        <p className="text-sm font-bold text-[#F4EADD]">
                          You hold seat{mySeats.length > 1 ? "s" : ""}{" "}
                          {mySeats.map((n) => `#${n}`).join(", ")}
                        </p>
                        <p className="text-xs text-[#C09A76]">
                          You have already reserved your seats in this game.
                        </p>
                      </div>
                    )}

                    {pendingSeats.length > 0 && (
                      <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#D08A5A]/30 bg-amber-500/10 p-4 text-center">
                        <Clock size={24} className="text-amber-400" />
                        <p className="text-sm font-bold text-[#F4EADD]">
                          {pendingSeats.length} seat{pendingSeats.length > 1 ? "s" : ""} awaiting approval:{" "}
                          {pendingSeats.map((n) => `#${n}`).join(", ")}
                        </p>
                        <p className="text-xs text-[#C09A76]">
                          Your payment is being verified by the admin.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2.5">
                      {seatMap.map((seat) => (
                        <button
                          key={seat.seatNumber}
                          disabled={notLoggedIn || seat.isReserved || hasSeats}
                          onClick={() => toggleSeat(seat.seatNumber)}
                          className={seatClasses(seat, selected.includes(seat.seatNumber))}
                        >
                          {seat.seatNumber}
                        </button>
                      ))}
                    </div>

                    {hasSeats && !notLoggedIn && (
                      <div className="mt-6 rounded-xl border border-[#3D2715] bg-white/[0.03] p-4 text-center">
                        <p className="text-sm font-semibold text-[#F4EADD]">
                          You already hold seat{mySeats.length > 1 ? "s" : ""}{" "}
                          {[...mySeats, ...pendingSeats].map((n) => `#${n}`).join(", ")} in this game.
                        </p>
                        <p className="mt-1 text-xs text-[#C09A76]">
                          No additional seats can be reserved from this link.
                        </p>
                      </div>
                    )}

                    {/* Selection summary + reserve (logged in only) */}
                    {!notLoggedIn && !hasSeats && (
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#3D2715]/60 pt-5">
                        <p className="text-sm text-[#C09A76]">
                          {selected.length > 0
                            ? `${selected.length} seat${selected.length > 1 ? "s" : ""} selected (${selected.map((n) => `#${n}`).join(", ")})`
                            : "Click available seats to reserve them"}
                        </p>
                        <button
                          onClick={() => setConfirming(true)}
                          disabled={selected.length === 0}
                          className={goldButton}
                        >
                          {selected.length > 0 ? (
                            <>
                              <Play size={16} />
                              Reserve {selected.length} Seat{selected.length > 1 ? "s" : ""}
                            </>
                          ) : (
                            "Select seats first"
                          )}
                        </button>
                      </div>
                    )}

                    {/* Auth CTA */}
                    {notLoggedIn && (
                      <div className="mt-6 rounded-xl border border-[#D29A45]/30 bg-[#D29A45]/10 p-5 text-center">
                        <Lock className="mx-auto mb-2 h-6 w-6 text-[#E3C49A]" />
                        <p className="text-sm font-semibold text-[#F4EADD]">
                          Log in to reserve your seat in this game
                        </p>
                        <p className="mt-1 text-xs text-[#C09A76]">
                          New here? Creating an account takes less than a minute.
                        </p>
                        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                          <Link
                            href={`/login?next=/game/${gameCode}`}
                            prefetch={false}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-5 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] sm:flex-none"
                          >
                            <LogIn size={16} />
                            Log in
                          </Link>
                          <Link
                            href={`/register?next=/game/${gameCode}`}
                            prefetch={false}
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D29A45]/60 px-5 py-2.5 text-sm font-semibold text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45]/10 sm:flex-none"
                          >
                            <UserPlus size={16} />
                            Create account
                          </Link>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Rules */}
              {game.rules ? (
                <div ref={rulesCardRef} className="min-w-0 rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
                  <h2 className="mb-3 text-lg font-bold text-[#F4EADD]">Rules</h2>
                  <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[#C09A76]">
                    {game.rules}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </main>

      {/* Payment popup */}
      {confirming && selected.length > 0 && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 text-center shadow-2xl shadow-black/50 max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setConfirming(false);
                setSelected([]);
              }}
              title="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#3D2715] bg-[#24140B] text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#D29A45]/20">
              <CreditCard size={26} className="text-[#E3C49A]" />
            </div>
            <h3 className="text-xl font-bold text-[#F4EADD]">Pay Here</h3>
            <p className="mt-1 text-sm text-[#C09A76]">
              Paying for seat{selected.length > 1 ? "s" : ""}{" "}
              {selected.map((n) => `#${n}`).join(", ")}
            </p>

            {/* Send donations */}
            <div className="mt-5 rounded-xl border border-[#D29A45]/30 bg-[#D29A45]/10 p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#E3C49A]">
                Pay Here to reserve your seat
              </p>
              <ul className="grid grid-cols-1 gap-x-3 gap-y-1.5 md:grid-cols-2">
                {[
                  { label: "Venmo", href: "https://venmo.com/u/Tommy-Hudson-3" },
                  { label: "PayPal", href: "https://www.paypal.com/paypalme/TommyHudson1974" },
                  { label: "Cash App", href: "https://cash.app/$vhhrott" },
                  {
                    label: "Debit/Credit Card",
                    href: "https://checkout.square.site/merchant/ML3144VNCTC5J/checkout/FDHLXSM6SOCWYZHEE6Q2YQMV",
                  },
                ].map((method) => (
                  <li key={method.label}>
                    <a
                      href={method.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#E3C49A] underline-offset-2 hover:underline"
                    >
                      {method.label}
                      <ExternalLink size={13} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment reference */}
            <div className="mt-4 rounded-xl border border-[#3D2715] bg-[#24140B] p-4 text-left">
              <label
                htmlFor="payment-reference"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#C09A76]"
              >
                Transaction / receipt reference <span className="text-amber-500">*</span>
              </label>
              <input
                id="payment-reference"
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. PayPal TID or bank receipt ID"
                className="w-full rounded-xl border border-[#3D2715] bg-[#331E10] px-3.5 py-2.5 text-sm text-[#F4EADD] outline-none transition-colors duration-300 placeholder:text-[#9A7A5C] focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20"
              />
            </div>

            {/* Payment screenshot */}
            <div className="mt-4 rounded-xl border border-[#3D2715] bg-[#24140B] p-4 text-left">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#C09A76]">
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
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-[#3D2715]"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="truncate text-xs text-[#C09A76]">
                      {paymentProofFile?.name}
                    </p>
                    <button
                      onClick={() => {
                        handlePaymentProofChange(undefined);
                        if (paymentProofRef.current) paymentProofRef.current.value = "";
                      }}
                      className="w-fit cursor-pointer rounded-lg bg-orange-600/10 px-3 py-1.5 text-xs font-semibold text-amber-500 transition-colors duration-300 hover:bg-orange-600/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => paymentProofRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#3D2715] bg-[#331E10] px-4 py-5 text-[#C09A76] transition-colors duration-300 hover:border-[#D29A45]/60 hover:text-[#E3C49A]"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs font-semibold">Upload payment screenshot</span>
                  <span className="text-[11px] text-[#9A7A5C]">JPG, PNG up to 5MB</span>
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-[#C09A76]">
              Make your payment to the account above, then enter the reference or upload the screenshot. The admin will verify it and approve your seats.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false);
                  setSelected([]);
                }}
                className="flex-1 cursor-pointer rounded-xl border border-[#3D2715] px-4 py-2.5 text-sm font-semibold text-[#C09A76] transition-colors duration-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                disabled={isReserving || !canSubmitPayment}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReserving && <Loader2 size={15} className="animate-spin" />}
                {isReserving ? "Submitting..." : "Pay & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
