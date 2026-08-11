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
  ImagePlus,
  X,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { useGetGameByCodeQuery } from '@/lib/api/gamesApi'
import { useReserveSeatsMutation } from '@/lib/api/userApi'
import { getErrorMessage, baseApi } from '@/lib/api/baseApi'
import { usePusherEvents } from '@/lib/pusher/usePusher'
import type { SeatInfo } from '@/lib/api/types'

const seatBase =
  'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg border text-sm font-bold transition-all duration-300 cursor-pointer'

function seatClasses(seat: SeatInfo, selected: boolean) {
  if (seat.isMine && seat.status === 'pending')
    return `${seatBase} cursor-not-allowed border-[#D08A5A]/60 bg-amber-500/15 text-amber-400`
  if (seat.isMine)
    return `${seatBase} cursor-not-allowed border-[#7E9C6B]/60 bg-emerald-500/10 text-emerald-400`
  if (seat.isReserved && seat.status === 'pending')
    return `${seatBase} cursor-not-allowed border-[#2E1C0E] bg-amber-500/10 text-amber-600/60`
  if (seat.isReserved)
    return `${seatBase} cursor-not-allowed border-[#2E1C0E] bg-[#100602] text-[#5C4633]`
  if (selected)
    return `${seatBase} border-[#D0AE95] bg-[#C78C3A]/20 text-white ring-2 ring-[#C78C3A]/40`
  return `${seatBase} border-[#2E1C0E] bg-white/[0.03] text-[#B08A6C] hover:border-[#C78C3A]/60 hover:text-white`
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
  const paymentProofRef = useRef<HTMLInputElement>(null)

  const game = data?.game
  const seatMap = data?.seatMap ?? []
  const mySeats = data?.userReservedSeats ?? []
  const pendingSeats = data?.pendingSeats ?? []

  const dispatch = useDispatch()
  usePusherEvents(game?._id ? `game-${game._id}` : null, ['seat-map:updated'], () => {
    dispatch(baseApi.util.invalidateTags(['Game']))
  })

  const canSubmitPayment =
    paymentReference.trim().length > 0 || paymentProofFile !== null

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
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#B08A6C] transition-colors duration-300 hover:text-[#F2E8DC]"
        >
          <ArrowLeft size={16} />
          Back to Active Games
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#B08A6C]">
            <Loader2 size={18} className="animate-spin" />
            Loading game...
          </div>
        ) : isError || !game ? (
          <div className="mx-auto max-w-md rounded-2xl border border-orange-600/30 bg-orange-600/10 p-8 text-center">
            <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
            <h1 className="text-xl font-bold text-[#F2E8DC]">Game not found</h1>
            <p className="mt-2 text-sm text-[#B08A6C]">
              This game link is invalid or the game may have been removed.
            </p>
            <Link
              href="/dashboard/active-games"
              prefetch={false}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-5 py-2.5 text-sm font-semibold text-[#1a1408] transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C]"
            >
              <ArrowLeft size={16} />
              Back to Active Games
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game info */}
            <div className="rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      Live
                    </span>
                    {mySeats.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C78C3A]/10 px-3 py-1 text-xs font-semibold text-[#D0AE95]">
                        <CheckCircle2 size={12} />
                        You hold seat{mySeats.length > 1 ? 's' : ''}{' '}
                        {mySeats.map((n) => `#${n}`).join(', ')}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-2xl font-bold text-[#F2E8DC] sm:text-3xl">
                    {game.title}
                  </h1>
                  <p className="mt-1 text-sm text-[#B08A6C]">
                    {game.description || 'Reserve your seat and try your luck to win the prize.'}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 rounded-xl bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Trophy size={16} className="text-[#D0AE95]" />
                    <span className="text-[#B08A6C]">Prize</span>
                    <span className="font-bold text-[#F2E8DC]">{game.prize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-[#D0AE95]" />
                    <span className="text-[#B08A6C]">Seats filled</span>
                    <span className="font-bold text-[#F2E8DC]">
                      {game.reservedSeatsCount}/{game.totalSeats}
                    </span>
                  </div>
                  {game.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-[#7E9C6B]" />
                      <span className="text-[#B08A6C]">Ends</span>
                      <span className="font-semibold text-[#F2E8DC]">
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
            <div className="rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#F2E8DC]">
                  {(mySeats.length + pendingSeats.length) > 0 ? 'Reserve More Seats' : 'Choose Your Seats'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#B08A6C]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded border border-[#2E1C0E] bg-white/[0.03]" />
                    Available
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-amber-500/30" />
                    Pending
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded bg-[#100602]" />
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
                    <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#7E9C6B]/30 bg-emerald-500/10 p-4 text-center">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <p className="text-sm font-bold text-[#F2E8DC]">
                        You hold seat{mySeats.length > 1 ? 's' : ''}{' '}
                        {mySeats.map((n) => `#${n}`).join(', ')}
                      </p>
                      <p className="text-xs text-[#B08A6C]">
                        You can reserve additional seats while they are available.
                      </p>
                    </div>
                  )}

                  {pendingSeats.length > 0 && (
                    <div className="mb-4 flex flex-col items-center gap-2 rounded-xl border border-[#D08A5A]/30 bg-amber-500/10 p-4 text-center">
                      <Clock size={24} className="text-amber-400" />
                      <p className="text-sm font-bold text-[#F2E8DC]">
                        {pendingSeats.length} seat{pendingSeats.length > 1 ? 's' : ''} awaiting approval:{' '}
                        {pendingSeats.map((n) => `#${n}`).join(', ')}
                      </p>
                      <p className="text-xs text-[#B08A6C]">
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

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#2E1C0E]/60 pt-5">
                    <p className="text-sm text-[#B08A6C]">
                      {selected.length > 0
                        ? `${selected.length} seat${selected.length > 1 ? 's' : ''} selected (${selected.map((n) => `#${n}`).join(', ')})`
                        : 'Click available seats to reserve them'}
                    </p>
                    <button
                      onClick={() => setConfirming(true)}
                      disabled={selected.length === 0}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-6 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
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
              <div className="rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-6 shadow-xl shadow-black/20">
                <h2 className="mb-3 text-lg font-bold text-[#F2E8DC]">Rules</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#B08A6C]">
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
          <div className="w-full max-w-lg rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-6 text-center shadow-2xl shadow-black/50 max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setConfirming(false)
                setSelected([])
              }}
              title="Close"
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#2E1C0E] bg-[#1B0F08] text-[#B08A6C] transition-colors duration-300 hover:bg-white/5 hover:text-white"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#C78C3A]/20">
              <CreditCard size={26} className="text-[#D0AE95]" />
            </div>
            <h3 className="text-xl font-bold text-[#F2E8DC]">Pay Here</h3>
            <p className="mt-1 text-sm text-[#B08A6C]">
              Paying for seat{selected.length > 1 ? 's' : ''}{' '}
              {selected.map((n) => `#${n}`).join(', ')}
            </p>

            {/* Send donations */}
            <div className="mt-5 rounded-xl border border-[#C78C3A]/30 bg-[#C78C3A]/10 p-4 text-left">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#D0AE95]">
                Pay Here to reserve your seat
              </p>
              <a
                href="https://linktr.ee/metaltubesandseeds"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[#D0AE95] underline-offset-2 hover:underline"
              >
                https://linktr.ee/metaltubesandseeds
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Payment reference */}
            <div className="mt-4 rounded-xl border border-[#2E1C0E] bg-[#1B0F08] p-4 text-left">
              <label
                htmlFor="payment-reference"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#B08A6C]"
              >
                Transaction / receipt reference <span className="text-amber-500">*</span>
              </label>
              <input
                id="payment-reference"
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. PayPal TID or bank receipt ID"
                className="w-full rounded-xl border border-[#2E1C0E] bg-[#241409] px-3.5 py-2.5 text-sm text-[#F2E8DC] outline-none transition-colors duration-300 placeholder:text-[#8A6A50] focus:border-[#C78C3A] focus:ring-2 focus:ring-[#C78C3A]/20"
              />
            </div>

            {/* Payment screenshot */}
            <div className="mt-4 rounded-xl border border-[#2E1C0E] bg-[#1B0F08] p-4 text-left">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#B08A6C]">
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
                    className="h-16 w-16 rounded-lg object-cover ring-1 ring-[#2E1C0E]"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="truncate text-xs text-[#B08A6C]">
                      {paymentProofFile?.name}
                    </p>
                    <button
                      onClick={() => {
                        handlePaymentProofChange(undefined)
                        if (paymentProofRef.current) paymentProofRef.current.value = ''
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
                  className="flex w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#2E1C0E] bg-[#241409] px-4 py-5 text-[#B08A6C] transition-colors duration-300 hover:border-[#C78C3A]/60 hover:text-[#D0AE95]"
                >
                  <ImagePlus size={20} />
                  <span className="text-xs font-semibold">Upload payment screenshot</span>
                  <span className="text-[11px] text-[#8A6A50]">JPG, PNG up to 5MB</span>
                </button>
              )}
            </div>

            <p className="mt-4 text-xs text-[#B08A6C]">
              Make your payment to the account above, then enter the reference or upload the screenshot. The admin will verify it and approve your seats.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false)
                  setSelected([])
                }}
                className="flex-1 cursor-pointer rounded-xl border border-[#2E1C0E] px-4 py-2.5 text-sm font-semibold text-[#B08A6C] transition-colors duration-300 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                disabled={isReserving || !canSubmitPayment}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] disabled:cursor-not-allowed disabled:opacity-50"
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
