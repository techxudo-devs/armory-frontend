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
      cls: 'bg-red-500/10 text-red-400',
    }
  return {
    label: 'Playing',
    cls: 'bg-sky-500/10 text-sky-400',
  }
}

export default function MySeatPage() {
  const { data, isLoading } = useGetMyJoinedGamesQuery({ page: 1, limit: 100 })
  const [historyPage, setHistoryPage] = useState(1)
  const [seatsPage, setSeatsPage] = useState(1)

  const joinedGames = data?.items ?? []
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
      tint: 'text-[#A5B4FC]',
    },
    {
      title: 'Total Wins',
      value: isLoading ? '—' : wonGames.length,
      icon: Trophy,
      tint: 'text-[#6EE7B7]',
    },
    {
      title: 'Total Loses',
      value: isLoading ? '—' : lostGames.length,
      icon: TrendingDown,
      tint: 'text-[#F87171]',
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
          <Ticket size={18} className="text-[#6667DD]" />
          <h2 className="text-xl font-bold text-[#F2F3F5]">Reserved Seats</h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-[76px] animate-pulse rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422]"
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
                  className="flex items-center justify-between rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-5 shadow-xl shadow-black/20 transition-colors hover:border-[#6667DD]/60"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6667DD]/10 text-sm font-bold text-[#A5B4FC]">
                      {game.mySeatNumber ? `#${game.mySeatNumber}` : '#' + (index + 1)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#F2F3F5]">{game.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-[#8B93A7]">
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
                    <p className="mb-2 text-xs font-medium text-[#8B93A7]">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${result.cls}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {result.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] py-12 text-center shadow-xl shadow-black/20">
            <Ticket className="mx-auto mb-3 text-[#8B93A7] opacity-50" size={26} />
            <p className="text-sm text-[#8B93A7]">
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
        <h2 className="mb-4 text-xl font-bold text-[#F2F3F5]">Game History</h2>
        <div className="overflow-hidden rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] shadow-xl shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#1F293D] bg-white/[0.02]">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8B93A7] max-lg:min-w-[280px]">Game</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8B93A7] max-lg:min-w-[120px]">Seat</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8B93A7] max-lg:min-w-[150px]">Result</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8B93A7] max-lg:min-w-[180px]">Prize</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#8B93A7] max-lg:min-w-[150px]">Joined</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#1F293D]/60 last:border-0">
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
                        className="border-b border-[#1F293D]/60 transition-colors last:border-0 hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-[#F2F3F5]">{game.title}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-[#6667DD]/10 px-2.5 py-1 text-xs font-bold text-[#A5B4FC]">
                            {game.mySeatNumber ? `#${game.mySeatNumber}` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${result.cls}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {result.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#F2F3F5]">{game.prize}</td>
                        <td className="px-5 py-4 text-sm text-[#9AA0AA]">
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
              <p className="text-sm text-[#8B93A7]">No game history yet. Join a game to get started.</p>
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
    <div className="flex items-center gap-4 rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-5 shadow-xl shadow-black/20">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Icon size={20} className={tint} />
      </div>
      <div>
        <p className="text-xs font-medium text-[#8B93A7]">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-[#F2F3F5]">{value}</p>
      </div>
    </div>
  )
}
