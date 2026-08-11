'use client'

import { Gamepad2, Trophy, Users, TrendingDown, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useGetMeQuery } from '@/lib/api/authApi'
import { useGetPublicGamesQuery } from '@/lib/api/gamesApi'
import { useGetMyJoinedGamesQuery } from '@/lib/api/userApi'
import type { Game } from '@/lib/api/gamesApi'

export default function UserDashboard() {
  const { data: user } = useGetMeQuery()
  const { data: publicGames, isLoading: gamesLoading } = useGetPublicGamesQuery({
    page: 1,
    limit: 50,
  })
  const { data: joinedData, isLoading: joinedLoading } = useGetMyJoinedGamesQuery({
    page: 1,
    limit: 100,
  })

  const activeGamesCount = publicGames?.pagination.totalDocs ?? 0
  const joinedGames = joinedData?.items ?? []
  const joinedIds = new Set(joinedGames.map((g) => g.gameId))
  const wonGames = joinedGames.filter((g) => g.isWinner)
  const lostGames = joinedGames.filter(
    (g) => !g.isWinner && (g.status === 'completed' || g.status === 'ended'),
  )

  const stats = [
    {
      title: 'Active Games',
      value: gamesLoading ? '—' : activeGamesCount,
      icon: Gamepad2,
      tint: 'text-[#D0AE95]',
    },
    {
      title: 'My Games',
      value: joinedLoading ? '—' : joinedGames.length,
      icon: Users,
      tint: 'text-[#7E9C6B]',
    },
    {
      title: 'Total Wins',
      value: joinedLoading ? '—' : wonGames.length,
      icon: Trophy,
      tint: 'text-[#D0AE95]',
    },
    {
      title: 'Total Loses',
      value: joinedLoading ? '—' : lostGames.length,
      icon: TrendingDown,
      tint: 'text-[#B4522C]',
    },
  ]

  const quickActions = [
    {
      href: '/dashboard/active-games',
      title: 'Active Games',
      subtitle: 'Play and join games',
      icon: Gamepad2,
      tint: 'text-[#D0AE95]',
      ring: 'hover:border-[#D0AE95]/40',
    },
    {
      href: '/dashboard/my-seats',
      title: 'My Seats',
      subtitle: 'Your reserved seats',
      icon: Trophy,
      tint: 'text-[#966D51]',
      ring: 'hover:border-[#966D51]/40',
    },
    {
      href: '/dashboard/notifications',
      title: 'Notifications',
      subtitle: 'View all updates',
      icon: Users,
      tint: 'text-[#7E9C6B]',
      ring: 'hover:border-[#7E9C6B]/40',
    },
  ]

  const featuredGames = publicGames?.items.slice(0, 3) ?? []

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}! Here&apos;s your gaming
          summary.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Featured Games */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F2E8DC]">Featured Games</h2>
          <Link
            href="/dashboard/active-games"
            prefetch={false}
            className="flex items-center gap-1 text-sm font-semibold text-[#C78C3A] transition-colors duration-300 hover:text-[#D0AE95]"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <GameCardSkeleton key={i} />)
          ) : featuredGames.length > 0 ? (
            featuredGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                isJoined={joinedIds.has(game._id)}
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] py-14 text-center shadow-xl shadow-black/20">
              <Gamepad2 className="mx-auto mb-3 text-[#B08A6C] opacity-50" size={28} />
              <p className="font-semibold text-[#F2E8DC]">No active games right now</p>
              <p className="mt-1 text-sm text-[#B08A6C]">Check back soon for new games</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-[#F2E8DC] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              prefetch={false}
              className={`group rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-6 text-center shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${action.ring}`}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition-colors duration-300 group-hover:bg-white/10">
                <action.icon size={24} className={action.tint} />
              </div>
              <h3 className="font-semibold text-[#F2E8DC]">{action.title}</h3>
              <p className="mt-1 text-sm text-[#B08A6C]">{action.subtitle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#C78C3A] opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  tint: string
}

function StatCard({ title, value, icon: Icon, tint }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1.5 text-xs font-medium text-[#B08A6C]">{title}</p>
          <p className="text-2xl font-bold text-[#F2E8DC]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Icon size={18} className={tint} />
        </div>
      </div>
    </div>
  )
}

function GameCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <div className="mb-3 h-5 w-2/3 rounded bg-white/5" />
      <div className="mb-5 h-4 w-full rounded bg-white/5" />
      <div className="mb-5 space-y-2.5">
        <div className="h-4 w-1/2 rounded bg-white/5" />
        <div className="h-4 w-1/2 rounded bg-white/5" />
      </div>
      <div className="h-10 w-full rounded-xl bg-white/5" />
    </div>
  )
}

interface GameCardProps {
  game: Game
  isJoined?: boolean
}

function GameCard({ game, isJoined }: GameCardProps) {
  return (
    <div className="group rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20 transition-all duration-300 hover:border-[#C78C3A]/60">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[#F2E8DC]">{game.title}</h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Live
        </span>
      </div>

      <div className="mb-5 mt-4 space-y-2.5 border-t border-[#2E1C0E]/60 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#B08A6C]">Prize</span>
          <span className="font-semibold text-[#F2E8DC]">{game.prize}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#B08A6C]">Seats Filled</span>
          <span className="font-medium text-[#F2E8DC]">
            {game.reservedSeatsCount}/{game.totalSeats}
          </span>
        </div>
      </div>

      {isJoined ? (
        <span className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 py-2.5 text-center text-sm font-semibold text-emerald-400">
          <CheckCircle2 size={16} />
          Joined
        </span>
      ) : (
        <Link
          href="/dashboard/active-games"
          prefetch={false}
          className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] py-2.5 text-center text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98]"
        >
          Join Game
        </Link>
      )}
    </div>
  )
}
