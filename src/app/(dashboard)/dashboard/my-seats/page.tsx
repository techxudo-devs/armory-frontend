'use client'

import { useState } from 'react'
import { Calendar, Users, Ticket, Trophy, TrendingDown } from 'lucide-react'
import { useGetMyJoinedGamesQuery } from '@/lib/api/userApi'
import { Pagination } from '@/components/Pagination'

const getResultBadge = (isWinner: boolean, status: string) => {
  if (isWinner)
    return {
      label: 'Won',
      cls: 'bg-emerald-500/10 text-emerald-400',
    }
  if (status === 'completed' || status === 'ended')
    return {
      label: 'Lost',
      cls: 'bg-orange-600/10 text-amber-500',
    }
  return {
    label: 'Playing',
    cls: 'bg-[#D29A45]/10 text-[#E3C49A]',
  }
}

export default function MySeatPage() {
  const { data, isLoading } = useGetMyJoinedGamesQuery({ page: 1, limit: 100 })
  const [historyPage, setHistoryPage] = useState(1)
  const [seatsPage, setSeatsPage] = useState(1)

  const joinedGames = data?.items ?? []
  const pendingCount = joinedGames.reduce(
    (acc, g) => acc + (g.pendingSeatNumbers?.length ?? 0),
    0,
  )
  const wonGames = joinedGames.filter((g) => g.isWinner)
  const lostGames = joinedGames.filter(
    (g) => !g.isWinner && (g.status === 'completed' || g.status === 'ended'),
  )

  const pageSize = 10
  const historyTotalPages = Math.max(1, Math.ceil(joinedGames.length / pageSize))
  const pagedGames = joinedGames.slice(
    (historyPage - 1) * pageSize,
    historyPage * pageSize,
  )

  const seatsPageSize = 5
  const seatsTotalPages = Math.max(
    1,
    Math.ceil(joinedGames.length / seatsPageSize),
  )
  const pagedSeats = joinedGames.slice(
    (seatsPage - 1) * seatsPageSize,
    seatsPage * seatsPageSize,
  )

  const summary = [
    {
      title: 'Games Played',
      value: isLoading ? '—' : joinedGames.length,
      icon: Users,
      tint: 'text-[#E3C49A]',
    },
    {
      title: 'Total Wins',
      value: isLoading ? '—' : wonGames.length,
      icon: Trophy,
      tint: 'text-[#8FAD7A]',
    },
    {
      title: 'Total Loses',
      value: isLoading ? '—' : lostGames.length,
      icon: TrendingDown,
      tint: 'text-[#B4522C]',
    },
  ]

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Seats</h1>
        <p className="text-muted-foreground">View your reserved seats and game participations.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {summary.map((item) => (
          <SummaryCard key={item.title} {...item} />
        ))}
      </div>

      {/* Reserved Seats */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Ticket size={18} className="text-[#D29A45]" />
          <h2 className="text-xl font-bold text-[#F4EADD]">Reserved Seats</h2>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {pendingCount} awaiting approval
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] animate-pulse rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B]"
              />
            ))}
          </div>
        ) : pagedSeats.length > 0 ? (
          <div className="space-y-3">
            {pagedSeats.map((game, index) => {
              const result = getResultBadge(game.isWinner, game.status)
              return (
                <div
                  key={game.gameId}
                  className="flex items-center justify-between rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20 transition-colors duration-300 hover:border-[#D29A45]/60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D29A45]/10 text-sm font-bold text-[#E3C49A]">
                      {game.mySeatNumbers.length > 1
                        ? `×${game.mySeatNumbers.length}`
                        : game.mySeatNumbers.length === 1
                          ? `#${game.mySeatNumbers[0]}`
                          : '#' + (index + 1)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#F4EADD]">{game.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-[#C09A76]">
                        <Calendar size={14} />
                        {game.joinedAt
                          ? new Date(game.joinedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="mb-2 text-xs font-medium text-[#C09A76]">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${result.cls}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {result.label}
                    </span>
                    {game.pendingSeatNumbers?.length > 0 && (
                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {game.pendingSeatNumbers.length} pending
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] py-12 text-center shadow-xl shadow-black/20">
            <Ticket className="mx-auto mb-3 text-[#C09A76] opacity-50" size={26} />
            <p className="text-sm text-[#C09A76]">
              No seats reserved yet. Join a game to reserve your seat.
            </p>
          </div>
        )}

        {!isLoading && joinedGames.length > 0 && (
          <Pagination
            page={seatsPage}
            totalPages={seatsTotalPages}
            totalDocs={joinedGames.length}
            pageSize={seatsPageSize}
            onPageChange={(p) => setSeatsPage(Math.min(seatsTotalPages, p))}
            label="seats"
          />
        )}
      </div>

      {/* Recent Game History */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-[#F4EADD]">Game History</h2>
        <div className="overflow-hidden rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#3D2715] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[280px]">Game</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[120px]">Seat</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[150px]">Result</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[180px]">Prize</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[150px]">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#3D2715]/60 last:border-0">
                      <td className="px-5 py-4"><div className="h-4 w-40 animate-pulse rounded bg-white/5" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-10 animate-pulse rounded bg-white/5" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-16 animate-pulse rounded-full bg-white/5" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-16 animate-pulse rounded bg-white/5" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 animate-pulse rounded bg-white/5" /></td>
                    </tr>
                  ))
                ) : joinedGames.length > 0 ? (
                  pagedGames.map((game) => {
                    const result = getResultBadge(game.isWinner, game.status)
                    return (
                      <tr
                        key={game.gameId}
                        className="border-b border-[#3D2715]/60 transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-[#F4EADD]">{game.title}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className="rounded-lg bg-[#D29A45]/10 px-2.5 py-1 text-xs font-bold text-[#E3C49A]">
                              {game.mySeatNumbers.length > 0
                                ? game.mySeatNumbers.map((n) => `#${n}`).join(', ')
                                : '—'}
                            </span>
                            {game.pendingSeatNumbers?.length > 0 && (
                              <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
                                {game.pendingSeatNumbers.map((n) => `#${n}`).join(', ')} pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${result.cls}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {result.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#F4EADD]">{game.prize}</td>
                        <td className="px-5 py-4 text-sm text-[#C09A76]">
                          {game.joinedAt
                            ? new Date(game.joinedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                      </tr>
                    )
                  })
                ) : null}
              </tbody>
            </table>
          </div>

          {!isLoading && joinedGames.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-[#C09A76]">No game history yet. Join a game to get started.</p>
            </div>
          )}

          {joinedGames.length > 0 && (
            <Pagination
              page={historyPage}
              totalPages={historyTotalPages}
              totalDocs={joinedGames.length}
              pageSize={pageSize}
              onPageChange={(p) => setHistoryPage(Math.min(historyTotalPages, p))}
              label="games"
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  tint: string
}

function SummaryCard({ title, value, icon: Icon, tint }: SummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Icon size={20} className={tint} />
      </div>
      <div>
        <p className="text-xs font-medium text-[#C09A76]">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-[#F4EADD]">{value}</p>
      </div>
    </div>
  )
}
