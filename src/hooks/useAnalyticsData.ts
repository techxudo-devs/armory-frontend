'use client'

// Dummy analytics data
export const analyticsData = {
  revenueChartData: [
    { month: 'Jan', revenue: 4000, players: 2400 },
    { month: 'Feb', revenue: 3000, players: 1398 },
    { month: 'Mar', revenue: 2000, players: 9800 },
    { month: 'Apr', revenue: 2780, players: 3908 },
    { month: 'May', revenue: 1890, players: 4800 },
    { month: 'Jun', revenue: 2390, players: 3800 },
    { month: 'Jul', revenue: 3490, players: 4300 },
    { month: 'Aug', revenue: 4200, players: 4600 },
  ],
  gameDistributionData: [
    { name: 'Action Games', value: 35 },
    { name: 'Puzzle Games', value: 25 },
    { name: 'Strategy Games', value: 20 },
    { name: 'Casual Games', value: 20 },
  ],
  playerGrowthData: [
    { week: 'Week 1', newPlayers: 400, activeUsers: 2400 },
    { week: 'Week 2', newPlayers: 300, activeUsers: 1221 },
    { week: 'Week 3', newPlayers: 200, activeUsers: 229 },
    { week: 'Week 4', newPlayers: 278, activeUsers: 200 },
    { week: 'Week 5', newPlayers: 189, activeUsers: 2290 },
    { week: 'Week 6', newPlayers: 239, activeUsers: 2000 },
    { week: 'Week 7', newPlayers: 349, activeUsers: 2181 },
  ],
  topGamesData: [
    { name: 'Game A', plays: 2400, winRate: 45 },
    { name: 'Game B', plays: 1398, winRate: 52 },
    { name: 'Game C', plays: 9800, winRate: 38 },
    { name: 'Game D', plays: 3908, winRate: 61 },
  ],
  stats: {
    totalGames: 1234,
    activeUsers: 5678,
    totalRevenue: 45000,
    avgGameDuration: 32,
  },
}

export function useAnalyticsData() {
  return analyticsData
}
