'use client'

import { useState, use } from 'react'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { useGetGameByCodeQuery } from '@/lib/api/gamesApi'
import { useReserveSeatMutation } from '@/lib/api/userApi'
import { getErrorMessage } from '@/lib/api/baseApi'

const seatBase =
  'flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-lg border text-sm font-bold transition-all cursor-pointer'

function seatClasses(seat: { isReserved: boolean; isMine: boolean }, selected: boolean) {
  if (seat.isMine)
    return `${seatBase} border-[#6EE7B7]/60 bg-emerald-500/10 text-emerald-400`
  if (seat.isReserved)
    return `${seatBase} cursor-not-allowed border-[#1F293D] bg-[#0A0E1A] text-[#3A4152]`
  if (selected)
    return `${seatBase} border-[#8B5CF6] bg-[#6667DD]/20 text-white ring-2 ring-[#6667DD]/40`
  return `${seatBase} border-[#1F293D] bg-white/[0.03] text-[#9AA0AA] hover:border-[#6667DD]/60 hover:text-white`
}

export default function GameSeatSelectionPage({
  params,
}: {
  params: Promise<{ gameCode: string }>
}) {
  const { gameCode: rawGameCode } = use(params)
  const gameCode = rawGameCode.toUpperCase()

  const { data, isLoading, isError } = useGetGameByCodeQuery(gameCode, {
    pollingInterval: 10000,
  })
  const [reserveSeat, { isLoading: isReserving }] = useReserveSeatMutation()
  const [selected, setSelected] = useState<number | null>(null)
  const [confirming, setConfirming] = useState(false)

  const game = data?.game
  const seatMap = data?.seatMap ?? []
  const mySeat = data?.userReservedSeat ?? null

  const handleConfirmReserve = async () => {
    if (!game || selected === null) return
    try {
      await reserveSeat({ gameId: game._id, seatNumber: selected }).unwrap()
      toast.success(`Seat #${selected} reserved successfully! Good luck!`)
      setConfirming(false)
      setSelected(null)
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
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#8B93A7] transition-colors hover:text-[#F2F3F5]"
        >
          <ArrowLeft size={16} />
          Back to Active Games
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-[#8B93A7]">
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
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#6667DD] to-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#5A5BD1] hover:to-[#7C3AED]"
            >
              <ArrowLeft size={16} />
              Back to Active Games
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game info */}
            <div className="rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-6 shadow-xl shadow-black/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      Live
                    </span>
                    {mySeat && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6667DD]/10 px-3 py-1 text-xs font-semibold text-[#A5B4FC]">
                        <CheckCircle2 size={12} />
                        You hold seat #{mySeat}
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
                    <span className="text-[#8B93A7]">Prize</span>
                    <span className="font-bold text-[#F2F3F5]">{game.prize}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-[#A5B4FC]" />
                    <span className="text-[#8B93A7]">Seats filled</span>
                    <span className="font-bold text-[#F2F3F5]">
                      {game.reservedSeatsCount}/{game.totalSeats}
                    </span>
                  </div>
                  {game.endDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-[#6EE7B7]" />
                      <span className="text-[#8B93A7]">Ends</span>
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
            <div className="rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-6 shadow-xl shadow-black/20">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#F2F3F5]">
                  {mySeat ? `Your Seat #${mySeat}` : 'Choose Your Seat'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#8B93A7]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded border border-[#1F293D] bg-white/[0.03]" />
                    Available
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

              {mySeat ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-[#6EE7B7]/30 bg-emerald-500/10 p-6 text-center">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                  <p className="font-bold text-[#F2F3F5]">
                    Seat #{mySeat} has been reserved successfully!
                  </p>
                  <p className="text-sm text-[#9AA0AA]">
                    You can reserve only one seat per game. Good luck!
                  </p>
                  <Link
                    href="/dashboard/active-games"
                    prefetch={false}
                    className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#6667DD] to-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-[#5A5BD1] hover:to-[#7C3AED]"
                  >
                    <ArrowLeft size={16} />
                    Back to Active Games
                  </Link>
                </div>
              ) : game.status !== 'active' ? (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
                  <p className="text-sm font-semibold text-amber-400">
                    This game is {game.status === 'completed' ? 'completed' : 'ended'} and no
                    longer accepting entries.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-2.5">
                    {seatMap.map((seat) => (
                      <button
                        key={seat.seatNumber}
                        disabled={seat.isReserved && !seat.isMine}
                        onClick={() => {
                          setSelected(seat.seatNumber)
                          setConfirming(true)
                        }}
                        className={seatClasses(seat, selected === seat.seatNumber)}
                      >
                        {seat.seatNumber}
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#1F293D]/60 pt-5">
                    <p className="text-sm text-[#8B93A7]">
                      {selected
                        ? `Seat #${selected} selected`
                        : 'Click any available seat to reserve it'}
                    </p>
                    <button
                      onClick={() => setConfirming(true)}
                      disabled={selected === null}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6667DD] to-[#8B5CF6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6667DD]/25 transition-all hover:from-[#5A5BD1] hover:to-[#7C3AED] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {selected ? (
                        <>
                          <Play size={16} />
                          Reserve Seat #{selected}
                        </>
                      ) : (
                        'Select a seat first'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Rules */}
            {game.rules ? (
              <div className="rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-6 shadow-xl shadow-black/20">
                <h2 className="mb-3 text-lg font-bold text-[#F2F3F5]">Rules</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#9AA0AA]">
                  {game.rules}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Confirm popup */}
      {confirming && selected !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-6 text-center shadow-2xl shadow-black/50">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#6667DD]/20">
              <Trophy size={26} className="text-[#A5B4FC]" />
            </div>
            <h3 className="text-xl font-bold text-[#F2F3F5]">Seat #{selected}</h3>
            <p className="mt-2 text-sm text-[#9AA0AA]">Do you want to reserve this seat?</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setConfirming(false)
                  setSelected(null)
                }}
                className="flex-1 cursor-pointer rounded-xl border border-[#1F293D] px-4 py-2.5 text-sm font-semibold text-[#9AA0AA] transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReserve}
                disabled={isReserving}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6667DD] to-[#8B5CF6] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6667DD]/25 transition-all hover:from-[#5A5BD1] hover:to-[#7C3AED] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReserving && <Loader2 size={15} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
