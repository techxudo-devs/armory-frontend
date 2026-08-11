'use client'

import { Users, Gamepad2, Ticket, Trophy, Plus } from 'lucide-react'
import Link from 'next/link'
import { useGetAdminAnalyticsQuery } from '@/lib/api/gamesApi'
import { RevenueChart } from '@/admin/charts/RevenueChart'
import { GameDistributionChart } from '@/admin/charts/GameDistributionChart'
import { PlayerGrowthChart } from '@/admin/charts/PlayerGrowthChart'
import { TopGamesChart } from '@/admin/charts/TopGamesChart'

export default function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminAnalyticsQuery(undefined)

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !data) {
    return <ErrorState />
  }

  const { stats, engagement, playerGrowth, gameDistribution, topGames } = data

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your gaming platform overview.</p>
        </div>
        <Link
          href="/admin/create-game"
          prefetch={false}
          className="group relative flex shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-5 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:shadow-[#C78C3A]/40 active:scale-[0.98]"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-[#B4522C] to-[#B4522C] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span className="relative flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Game
          </span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon={<Gamepad2 className="text-amber-500" size={24} />}
        />
        <StatCard
          title="Active Users"
          value={stats.registeredUsers}
          icon={<Users className="text-amber-500" size={24} />}
        />
        <StatCard
          title="Seats Reserved"
          value={stats.totalSeatsReserved}
          icon={<Ticket className="text-green-500" size={24} />}
        />
        <StatCard
          title="Completed Games"
          value={stats.completedGames}
          icon={<Trophy className="text-amber-500" size={24} />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <RevenueChart data={engagement} />
        <GameDistributionChart data={gameDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlayerGrowthChart data={playerGrowth} />
        <TopGamesChart data={topGames} />
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[#B08A6C] mb-1.5">{title}</p>
          <p className="text-2xl font-bold text-[#F2E8DC]">{value}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
          {icon}
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#C78C3A] border-t-transparent" />
      <p className="text-sm text-[#B08A6C]">Loading dashboard analytics...</p>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-sm text-[#B08A6C]">
        Unable to load dashboard data. Please try again later.
      </p>
    </div>
  )
}
