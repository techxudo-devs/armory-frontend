'use client'

import { Users, Gamepad2, Ticket, Trophy } from 'lucide-react'
import { useGetAdminAnalyticsQuery } from '@/lib/api/gamesApi'
import { RevenueChart } from '@/admin/charts/RevenueChart'
import { GameDistributionChart } from '@/admin/charts/GameDistributionChart'
import { PlayerGrowthChart } from '@/admin/charts/PlayerGrowthChart'
import { TopGamesChart } from '@/admin/charts/TopGamesChart'

export default function AdminDashboard() {
  const { data, isLoading, isError } = useGetAdminAnalyticsQuery()

  if (isLoading) {
    return <LoadingState />
  }

  if (isError || !data) {
    return <ErrorState />
  }

  const { stats, engagement, playerGrowth, gameDistribution, topGames } = data

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your gaming platform overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Games"
          value={stats.totalGames}
          icon={<Gamepad2 className="text-blue-500" size={24} />}
        />
        <StatCard
          title="Active Users"
          value={stats.registeredUsers}
          icon={<Users className="text-purple-500" size={24} />}
        />
        <StatCard
          title="Seats Reserved"
          value={stats.totalSeatsReserved}
          icon={<Ticket className="text-green-500" size={24} />}
        />
        <StatCard
          title="Completed Games"
          value={stats.completedGames}
          icon={<Trophy className="text-orange-500" size={24} />}
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
    <div className="rounded-2xl border border-[#1F293D] bg-gradient-to-b from-[#151A2A] to-[#0F1422] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-[#8B93A7] mb-1.5">{title}</p>
          <p className="text-2xl font-bold text-[#F2F3F5]">{value}</p>
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
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#6667DD] border-t-transparent" />
      <p className="text-sm text-[#8B93A7]">Loading dashboard analytics...</p>
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <p className="text-sm text-[#8B93A7]">
        Unable to load dashboard data. Please try again later.
      </p>
    </div>
  )
}
