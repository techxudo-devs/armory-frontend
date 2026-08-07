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
      tint: 'text-[#A5B4FC]',
    },
    {
      title: 'My Games',
      value: joinedLoading ? '—' : joinedGames.length,
      icon: Users,
      tint: 'text-[#6EE7B7]',
    },
    {
      title: 'Total Wins',
      value: joinedLoading ? '—' : wonGames.length,
      icon: Trophy,
      tint: 'text-[#FDBA74]',
    },
    {
      title: 'Total Loses',
      value: joinedLoading ? '—' : lostGames.length,
      icon: TrendingDown,
      tint: 'text-[#F87171]',
    },
  ]

  const quickActions = [
    {
      href: '/dashboard/active-games',
      title: 'Active Games',
      subtitle: 'Play and join games',
      icon: Gamepad2,
      tint: 'text-[#A5B4FC]',
      ring: 'hover:border-[#A5B4FC]/40',
    },
    {
      href: '/dashboard/my-seats',
      title: 'My Seats',
      subtitle: 'Your reserved seats',
      icon: Trophy,
      tint: 'text-[#C4B5FD]',
      ring: 'hover:border-[#C4B5FD]/40',
    },
    {
      href: '/dashboard/notifications',
      title: 'Notifications',
      subtitle: 'View all updates',
      icon: Users,
      tint: 'text-[#6EE7B7]',
      ring: 'hover:border-[#6EE7B7]/40',
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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#F2F3F5] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-6 text-center shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-lg ${action.ring}`}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 transition-colors group-hover:bg-white/10">
                <action.icon size={24} className={action.tint} />
              </div>
              <h3 className="font-semibold text-[#F2F3F5]">{action.title}</h3>
              <p className="mt-1 text-sm text-[#8B93A7]">{action.subtitle}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#6667DD] opacity-0 transition-opacity group-hover:opacity-100">
                Open <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Games */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F2F3F5]">Featured Games</h2>
          <Link
            href="/dashboard/active-games"
            className="flex items-center gap-1 text-sm font-semibold text-[#6667DD] transition-colors hover:text-[#A5B4FC]"
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
            <div className="col-span-full rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] py-14 text-center shadow-xl shadow-black/20">
              <Gamepad2 className="mx-auto mb-3 text-[#8B93A7] opacity-50" size={28} />
              <p className="font-semibold text-[#F2F3F5]">No active games right now</p>
              <p className="mt-1 text-sm text-[#8B93A7]">Check back soon for new games</p>
            </div>
          )}
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
    <div className="rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1.5 text-xs font-medium text-[#8B93A7]">{title}</p>
          <p className="text-2xl font-bold text-[#F2F3F5]">{value}</p>
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
    <div className="animate-pulse rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-5 shadow-xl shadow-black/20">
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
    <div className="group rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-5 shadow-xl shadow-black/20 transition-all hover:border-[#6667DD]/60">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[#F2F3F5]">{game.title}</h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Live
        </span>
      </div>

      <div className="mb-5 mt-4 space-y-2.5 border-t border-[#1F293D]/60 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8B93A7]">Prize</span>
          <span className="font-semibold text-[#F2F3F5]">{game.prize}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#8B93A7]">Seats Filled</span>
          <span className="font-medium text-[#F2F3F5]">
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
          className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#6667DD] to-[#8B5CF6] py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#6667DD]/25 transition-all hover:from-[#5A5BD1] hover:to-[#7C3AED] active:scale-[0.98]"
        >
          Join Game
        </Link>
      )}
    </div>
  )
}
