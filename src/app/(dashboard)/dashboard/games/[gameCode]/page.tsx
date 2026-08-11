'use client'

import { useState, use, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Loader2,
  Trophy,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  CreditCard,
  Copy,
  Check,
  ImagePlus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useGetGameByCodeQuery } from '@/lib/api/gamesApi'
import { useReserveSeatsMutation } from '@/lib/api/userApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import { PAYMENT_ACCOUNT } from '@/lib/paymentConfig'
import type { SeatInfo } from '@/lib/api/types'

const seatBase =
  'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg border text-sm font-bold transition-all cursor-pointer'

function seatClasses(seat: SeatInfo, selected: boolean) {
  if (seat.isMine && seat.status === 'pending')
    return `${seatBase} cursor-not-allowed border-[#FB923C]/60 bg-amber-500/15 text-amber-400`
  if (seat.isMine)
    return `${seatBase} cursor-not-allowed border-[#6EE7B7]/60 bg-emerald-500/10 text-emerald-400`
  if (seat.isReserved && seat.status === 'pending')
    return `${seatBase} cursor-not-allowed border-[#23272D] bg-amber-500/10 text-amber-600/60`
  if (seat.isReserved)
    return `${seatBase} cursor-not-allowed border-[#23272D] bg-[#0A0E1A] text-[#3A4152]`
  if (selected)
    return `${seatBase} border-[#E68078] bg-[#E53535]/20 text-white ring-2 ring-[#E53535]/40`
  return `${seatBase} border-[#23272D] bg-white/[0.03] text-[#9AA0AA] hover:border-[#E53535]/60 hover:text-white`
}

export default function GameSeatSelectionPage({
  params,
}: {
  params: Promise<{ gameCode: string }>
}) {
  const { gameCode: rawGameCode } = use(params)
  const gameCode = rawGameCode.toUpperCase()

  const { data, isLoading, isError } = useGetGameByCodeQuery(gameCode)
  const [reserveSeats, { isLoading: isReserving }] = useReserveSeatsMutation()
  const [selected, setSelected] = useState<number[]>([])
  const [confirming, setConfirming] = useState(false)
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null)
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null)
  const [copiedPayment, setCopiedPayment] = useState(false)
  const paymentProofRef = useRef<HTMLInputElement>(null)

  const game = data?.game
  const seatMap = data?.seatMap ?? []
  const mySeats = data?.userReservedSeats ?? []
  const pendingSeats = data?.pendingSeats ?? []

  const canSubmitPayment =
    paymentReference.trim().length > 0 || paymentProofFile !== null

  const copyPaymentAccount = async () => {
    try {
      await navigator.clipboard.writeText(
        `${PAYMENT_ACCOUNT.holder}: ${PAYMENT_ACCOUNT.number} (PSID ${PAYMENT_ACCOUNT.psid})`,
      )
      setCopiedPayment(true)
      setTimeout(() => setCopiedPayment(false), 2000)
    } catch {
      toast.error('Could not copy account details')
    }
  }

  const handlePaymentProofChange = (file: File | undefined) => {
    setPaymentProofFile(file ?? null)
    setPaymentProofPreview(file ? URL.createObjectURL(file) : null)
  }

  const toggleSeat = (seatNumber: number) => {
    setSelected((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((n) => n !== seatNumber)
        : [...prev, seatNumber],
    )
  }

  const handleConfirmReserve = async () => {
    if (!game || selected.length === 0) return
    if (!canSubmitPayment) {
      toast.error('Please provide a payment reference or upload a payment screenshot.')
      return
    }
    const seatsToReserve = selected.filter(
      (n) => !mySeats.includes(n) && !pendingSeats.includes(n),
    )
    if (seatsToReserve.length === 0) {
      setConfirming(false)
      setSelected([])
      toast.info('Those seats are already yours.')
      return
    }
    try {
      await reserveSeats({
        gameId: game._id,
        seatNumbers: seatsToReserve,
        paymentReference: paymentReference.trim(),
        paymentProof: paymentProofFile ?? undefined,
      }).unwrap()
      toast.success(
        `Seat ${seatsToReserve.map((n) => `#${n}`).join(', ')} submitted. They are now pending admin approval.`,
      )
      setConfirming(false)
      setSelected([])
      setPaymentReference('')
      setPaymentProofFile(null)
      if (paymentProofPreview) URL.revokeObjectURL(paymentProofPreview)
      setPaymentProofPreview(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
      setConfirming(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6">
        <Link
          href="/dashboard/active-games"
          prefetch={false}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#9AA0AA] transition-colors hover:text-[#F2F3F5]"
        >
          <ArrowLeft size={16} />
          Back to Active Games
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#9AA0AA]">
            <Loader2 size={18} className="animate-spin" />
            Loading game...
          </div>
        ) : isError || !game ? (
          <div className="mx-auto max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
            <h1 className="text-xl font-bold text-[#F2F3F5]">Game not found</h1>
            <p className="mt-2 text-sm text-[#9AA0AA]">
              This game link is invalid or the game may have been removed.
            </p>
            <Link
              href="/dashboard/active-games"
              prefetch={false}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#E53535] to-[#E68078] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#C62E2E] hover:to-[#C94F47]"
            >
              <ArrowLeft size={16} />
              Back to Active Games
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game info */}
            <div className="rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      Live
                    </span>
                    {mySeats.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E53535]/10 px-3 py-1 text-xs font-semibold text-[#E68078]">
                        <CheckCircle2 size={12} />
                        You hold seat{mySeats.length > 1 ? 's' : ''}{' '}
                        {mySeats.map((n) => `#${n}`).join(', ')}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-2xl font-bold text-[#F2F3F5] sm:text-3xl">
                    {game.title}
                  </h1>
                  <p className="mt-1 text-sm text-[#9AA0AA]">
                    {game.description || 'Reserve your seat and try your luck to win the prize.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 rounded-xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy size={16} className="text-[#FDBA74]" />
                    <span className="text-[#9AA0AA]">Prize</span>
                    <span className="font-bold text-[#F2F3F5]">{game.prize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-[#E68078]" />
                    <span className="text-[#9AA0AA]">Seats filled</span>
                    <span className="font-bold text-[#F2F3F5]">
                      {game.reservedSeatsCount}/{game.totalSeats}
                    </span>
                  </div>
                  {game.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-[#6EE7B7]" />
                      <span className="text-[#9AA0AA]">Ends</span>
                      <span className="font-semibold text-[#F2F3F5]">
                        {new Date(game.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Seat selection */}
            <div className="rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#F2F3F5]">
                  {(mySeats.length + pendingSeats.length) > 0 ? 'Reserve More Seats' : 'Choose Your Seats'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9AA0AA]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded border border-[#23272D] bg-white/[0.03]" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-amber-500/30" />
                    Pending
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-[#0A0E1A]" />
                    Reserved
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-emerald-500/40" />
                    My Seat
                  </span>
                </div>
              </div>

              {game.status !== 'active' ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
                  <p className="text-sm font-semibold text-amber-400">
                    This game is {game.status === 'completed' ? 'completed' : 'ended'} and no
                    longer accepting entries.
                  </p>
                </div>
              ) : (
                <>
                  {mySeats.length > 0 && (
                    <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#6EE7B7]/30 bg-emerald-500/10 p-4 text-center">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <p className="text-sm font-bold text-[#F2F3F5]">
                        You hold seat{mySeats.length > 1 ? 's' : ''}{' '}
                        {mySeats.map((n) => `#${n}`).join(', ')}
                      </p>
                      <p className="text-xs text-[#9AA0AA]">
                        You can reserve additional seats while they are available.
                      </p>
                    </div>
                  )}

                  {pendingSeats.length > 0 && (
                    <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#FB923C]/30 bg-amber-500/10 p-4 text-center">
                      <Clock size={24} className="text-amber-400" />
                      <p className="text-sm font-bold text-[#F2F3F5]">
                        {pendingSeats.length} seat{pendingSeats.length > 1 ? 's' : ''} awaiting approval:{' '}
                        {pendingSeats.map((n) => `#${n}`).join(', ')}
                      </p>
                      <p className="text-xs text-[#9AA0AA]">
                        Your payment is being verified by the admin.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5">
                    {seatMap.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.isReserved}
                        onClick={() => toggleSeat(seat.seatNumber)}
                        className={seatClasses(seat, selected.includes(seat.seatNumber))}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#23272D]/60 pt-5">
                    <p className="text-sm text-[#9AA0AA]">
                      {selected.length > 0
                        ? `${selected.length} seat${selected.length > 1 ? 's' : ''} selected (${selected.map((n) => `#${n}`).join(', ')})`
                        : 'Click available seats to reserve them'}
                    </p>
                    <button
                      onClick={() => setConfirming(true)}
                      disabled={selected.length === 0}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E53535] to-[#E68078] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E53535]/25 transition-all hover:from-[#C62E2E] hover:to-[#C94F47] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selected.length > 0 ? (
                        <>
                          <Play size={16} />
                          Reserve {selected.length} Seat{selected.length > 1 ? 's' : ''}
                        </>
                      ) : (
                        'Select seats first'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Rules */}
            {game.rules ? (
              <div className="rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-6 shadow-xl shadow-black/20">
                <h2 className="mb-3 text-lg font-bold text-[#F2F3F5]">Rules</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#9AA0AA]">
                  {game.rules}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Payment popup */}
      {confirming && selected.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-6 text-center shadow-2xl shadow-black/50 max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setConfirming(false)
                setSelected([])
              }}
              title="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#23272D] bg-[#14171B] text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#E53535]/20">
              <CreditCard size={26} className="text-[#E68078]" />
            </div>
            <h3 className="text-xl font-bold text-[#F2F3F5]">Pay Here</h3>
            <p className="mt-1 text-sm text-[#9AA0AA]">
              Paying for seat{selected.length > 1 ? 's' : ''}{' '}
              {selected.map((n) => `#${n}`).join(', ')}
            </p>

            {/* Payment account */}
            <div className="mt-5 rounded-xl border border-[#E53535]/30 bg-[#E53535]/10 p-4 text-left">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#E68078]">
                Pay to this account
              </p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#F2F3F5]">{PAYMENT_ACCOUNT.number}</p>
                  <p className="mt-0.5 text-xs text-[#9AA0AA]">
                    {PAYMENT_ACCOUNT.holder} · PSID {PAYMENT_ACCOUNT.psid}
                  </p>
                </div>
                <button
                  onClick={copyPaymentAccount}
                  title="Copy account details"
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#E53535] to-[#E68078] px-3 py-2 text-xs font-semibold text-white transition-all hover:from-[#C62E2E] hover:to-[#C94F47]"
                >
                  {copiedPayment ? <Check size={13} /> : <Copy size={13} />}
                  {copiedPayment ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Payment reference */}
            <div className="mt-4 rounded-xl border border-[#23272D] bg-[#14171B] p-4 text-left">
              <label
                htmlFor="payment-reference"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9AA0AA]"
              >
                Transaction / receipt reference <span className="text-red-400">*</span>
              </label>
              <input
                id="payment-reference"
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. JazzCash TID or bank receipt ID"
                className="w-full rounded-xl border border-[#23272D] bg-[#191D22] px-3.5 py-2.5 text-sm text-[#F2F3F5] outline-none transition-colors placeholder:text-[#5C636D] focus:border-[#E53535] focus:ring-2 focus:ring-[#E53535]/20"
              />
            </div>

            {/* Payment screenshot */}
            <div className="mt-4 rounded-xl border border-[#23272D] bg-[#14171B] p-4 text-left">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#9AA0AA]">
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
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-[#23272D]"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="truncate text-xs text-[#9AA0AA]">
                      {paymentProofFile?.name}
                    </p>
                    <button
                      onClick={() => {
                        handlePaymentProofChange(undefined)
                        if (paymentProofRef.current) paymentProofRef.current.value = ''
                      }}
                      className="w-fit cursor-pointer rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => paymentProofRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#23272D] bg-[#191D22] px-4 py-5 text-[#9AA0AA] transition-colors hover:border-[#E53535]/60 hover:text-[#E68078]"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs font-semibold">Upload payment screenshot</span>
                  <span className="text-[11px] text-[#5C636D]">JPG, PNG up to 5MB</span>
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-[#9AA0AA]">
              Make your payment to the account above, then enter the reference or upload the screenshot. The admin will verify it and approve your seats.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false)
                  setSelected([])
                }}
                className="flex-1 cursor-pointer rounded-xl border border-[#23272D] px-4 py-2.5 text-sm font-semibold text-[#9AA0AA] transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                disabled={isReserving || !canSubmitPayment}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E53535] to-[#E68078] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E53535]/25 transition-all hover:from-[#C62E2E] hover:to-[#C94F47] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isReserving && <Loader2 size={15} className="animate-spin" />}
                {isReserving ? 'Submitting...' : 'Pay & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
