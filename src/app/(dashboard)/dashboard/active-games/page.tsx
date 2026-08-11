'use client'

import { Play, Clock, Users, Trophy, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGetPublicGamesQuery } from '@/lib/api/gamesApi'
import { useGetMyJoinedGamesQuery } from '@/lib/api/userApi'
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

  const availableGames = publicData?.items ?? []
  const joinedGames = joinedData?.items ?? []
  const joinedIds = new Set(joinedGames.map((g) => g.gameId))
  const activeParticipations = joinedGames.filter((g) => g.status === 'active')
  const joinableGames = availableGames.filter((g) => !joinedIds.has(g._id))

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Active Games</h1>
        <p className="text-muted-foreground">
          Join active games and compete with other players.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-[#F2F3F5]">Available Games</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <GameCardSkeleton key={i} />)
          ) : joinableGames.length > 0 ? (
            joinableGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                onJoin={() => router.push(`/dashboard/games/${game.gameCode}`)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] py-14 text-center shadow-xl shadow-black/20">
              <Trophy className="mx-auto mb-3 text-[#9AA0AA] opacity-50" size={28} />
              <p className="font-semibold text-[#F2F3F5]">
                {availableGames.length > 0
                  ? 'You have joined all active games'
                  : 'No active games right now'}
              </p>
              <p className="mt-1 text-sm text-[#9AA0AA]">Check back soon for new games</p>
            </div>
          )}
        </div>
      </div>

      {activeParticipations.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-[#E53535]" />
            <h2 className="text-xl font-bold text-[#F2F3F5]">Your Active Participations</h2>
          </div>
          <div className="space-y-3">
            {activeParticipations.map((game) => (
              <div
                key={game.gameId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[#E53535]/30 bg-gradient-to-r from-[#E53535]/10 to-[#E68078]/10 p-5 shadow-xl shadow-black/20"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                      Playing
                    </span>
                    {game.pendingSeatNumbers?.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {game.pendingSeatNumbers.length} seat
                        {game.pendingSeatNumbers.length > 1 ? 's' : ''} pending approval
                      </span>
                    )}
                    <h3 className="truncate font-semibold text-[#F2F3F5]">{game.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-[#9AA0AA]">
                    {game.mySeatNumbers.length > 0
                      ? `You hold seat${game.mySeatNumbers.length > 1 ? 's' : ''} ${game.mySeatNumbers.map((n) => `#${n}`).join(', ')}`
                      : 'Seat assigned'}
                    {' · '}
                    {game.prize}
                  </p>
                </div>
                <span className="shrink-0 rounded-xl bg-[#E53535]/10 px-4 py-2 text-sm font-bold text-[#E68078]">
                  {game.mySeatNumbers.length > 0
                    ? game.mySeatNumbers.map((n) => `#${n}`).join(', ')
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function GameCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20">
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
  onJoin: () => void
}

function GameCard({ game, onJoin }: GameCardProps) {
  return (
    <div className="group rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20 transition-all hover:border-[#E53535]/60">
      <div className="mb-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-[#F2F3F5]">{game.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            Live
          </span>
        </div>
        <p className="line-clamp-3 text-sm text-[#9AA0AA]">
          {game.description ?? 'Reserve your seat and try your luck to win the prize.'}
        </p>
      </div>

      <div className="mb-5 space-y-2.5 border-t border-[#23272D]/60 pt-4">
        <div className="flex items-center gap-3 text-sm">
          <Trophy size={15} className="shrink-0 text-[#FDBA74]" />
          <span className="text-[#9AA0AA]">Prize:</span>
          <span className="font-semibold text-[#F2F3F5]">{game.prize}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Users size={15} className="shrink-0 text-[#E68078]" />
          <span className="text-[#9AA0AA]">Seats Filled:</span>
          <span className="font-medium text-[#F2F3F5]">
            {game.reservedSeatsCount}/{game.totalSeats}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock size={15} className="shrink-0 text-[#6EE7B7]" />
          <span className="text-[#9AA0AA]">Status:</span>
          <span className="font-semibold text-[#6EE7B7]">Active Now</span>
        </div>
      </div>

      <button
        onClick={onJoin}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E53535] to-[#E68078] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E53535]/25 transition-all hover:from-[#C62E2E] hover:to-[#C94F47] active:scale-[0.98]"
      >
        <Play size={16} />
        Join Game
      </button>
    </div>
  )
}
