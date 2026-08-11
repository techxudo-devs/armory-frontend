'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Play, Clock, Users, Trophy, BadgeCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGetPublicGamesQuery } from '@/lib/api/gamesApi'
import { useGetMyJoinedGamesQuery } from '@/lib/api/userApi'
import { getPusherClient } from '@/lib/pusher/client'
import { baseApi } from '@/lib/api/baseApi'
import type { Game } from '@/lib/api/gamesApi'

export default function ActiveGamesPage() {
  const router = useRouter()

  const { data: publicData, isLoading: gamesLoading } = useGetPublicGamesQuery({
    page: 1,
    limit: 50,
  })
  const { data: joinedData } = useGetMyJoinedGamesQuery({
    page: 1,
    limit: 100,
  })
  const dispatch = useDispatch()

  const availableGames = publicData?.items ?? []
  const availableGameChannels = availableGames.map((g) => g._id).join('|')

  useEffect(() => {
    if (!availableGames.length) return
    const pusher = getPusherClient()
    if (!pusher) return

    const invalidate = () => dispatch(baseApi.util.invalidateTags(['Game']))
    const channels = availableGames.map((g) => pusher.subscribe(`game-${g._id}`))
    channels.forEach((ch) => ch.bind('seat-map:updated', invalidate))

    return () => {
      channels.forEach((ch) => {
        ch.unbind('seat-map:updated', invalidate)
        pusher.unsubscribe(ch.name)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableGameChannels, dispatch])

  const joinedGames = joinedData?.items ?? []
  const joinedSeatsByGame = new Map<string, number[]>()
  joinedGames.forEach((g) => {
    joinedSeatsByGame.set(g.gameId, g.mySeatNumbers ?? [])
  })

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Active Games</h1>
        <p className="text-muted-foreground">
          Join active games and compete with other players.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-[#F4EADD]">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <GameCardSkeleton key={i} />)
          ) : availableGames.length > 0 ? (
            availableGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                joined={joinedSeatsByGame.has(game._id)}
                seatNumbers={joinedSeatsByGame.get(game._id) ?? []}
                onOpen={() => router.push(`/dashboard/games/${game.gameCode}`)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] py-14 text-center shadow-xl shadow-black/20">
              <Trophy className="mx-auto mb-3 text-[#C09A76] opacity-50" size={28} />
              <p className="font-semibold text-[#F4EADD]">No active games right now</p>
              <p className="mt-1 text-sm text-[#C09A76]">Check back soon for new games</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function GameCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20">
      <div className="mb-3 h-5 w-2/3 rounded bg-white/5" />
      <div className="mb-5 h-4 w-full rounded bg-white/5" />
      <div className="mb-5 space-y-2.5">
        <div className="h-4 w-1/2 rounded bg-white/5" />
        <div className="h-4 w-1/2 rounded bg-white/5" />
        <div className="h-4 w-1/2 rounded bg-white/5" />
      </div>
      <div className="h-10 w-full rounded-xl bg-white/5" />
    </div>
  )
}

interface GameCardProps {
  game: Game
  joined: boolean
  seatNumbers: number[]
  onOpen: () => void
}

function GameCard({ game, joined, seatNumbers, onOpen }: GameCardProps) {
  const seatLabel = joined
    ? seatNumbers.length > 0
      ? `Participated · ${seatNumbers.map((n) => `#${n}`).join(', ')}`
      : 'Participated'
    : 'Participate'

  return (
    <div className="group rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20 transition-all duration-300 hover:border-[#D29A45]/60">
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-[#F4EADD]">{game.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            {joined ? 'Participating' : 'Live'}
          </span>
        </div>
        <p className="line-clamp-3 text-sm text-[#C09A76]">
          {game.description ?? 'Reserve your seat and try your luck to win the prize.'}
        </p>
      </div>

      <div className="mb-5 space-y-2.5 border-t border-[#3D2715]/60 pt-4">
        <div className="flex items-center gap-3 text-sm">
          <Trophy size={15} className="shrink-0 text-[#E3C49A]" />
          <span className="text-[#C09A76]">Prize:</span>
          <span className="font-semibold text-[#F4EADD]">{game.prize}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Users size={15} className="shrink-0 text-[#E3C49A]" />
          <span className="text-[#C09A76]">Seats Filled:</span>
          <span className="font-medium text-[#F4EADD]">
            {game.reservedSeatsCount}/{game.totalSeats}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock size={15} className="shrink-0 text-[#8FAD7A]" />
          <span className="text-[#C09A76]">Status:</span>
          <span className="font-semibold text-[#8FAD7A]">Active Now</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          onClick={onOpen}
          disabled={joined}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
            joined
              ? 'cursor-not-allowed border border-[#3D2715] bg-transparent text-[#C09A76] opacity-60'
              : 'cursor-pointer bg-gradient-to-r from-[#D29A45] to-[#E3C49A] text-[#1a1408] shadow-lg shadow-[#D29A45]/25 hover:from-[#B4522C] hover:to-[#B4522C]'
          }`}
        >
          <Play size={16} />
          Join Game
        </button>
        <button
          onClick={onOpen}
          disabled={joined}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 active:scale-[0.98] ${
            joined
              ? 'cursor-not-allowed border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              : 'cursor-pointer border border-[#3D2715] bg-transparent text-[#C09A76] hover:border-[#D29A45]/60 hover:text-[#E3C49A]'
          }`}
        >
          <BadgeCheck size={16} />
          {seatLabel}
        </button>
      </div>
    </div>
  )
}
