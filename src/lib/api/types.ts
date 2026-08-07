export interface Game {
  _id: string
  title: string
  prize: string
  prizeImageUrl?: string
  description?: string
  rules?: string
  gameCode: string
  totalSeats: number
  reservedSeatsCount: number
  numberOfWinners: number
  status: 'active' | 'ended' | 'completed'
  endType: 'manual' | 'automatic'
  endDate: string | null
  winners?: Array<{
    seatNumber: number
    user: { _id: string; fullName: string; phone: string } | string
  }>
  createdBy?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  fullName: string
  email: string
  phone: string
  avatarUrl?: string
  role: 'admin' | 'user'
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

export type AuthUser = User

export interface GameHistory {
  _id: string
  gameId: string
  gameName: string
  seatNumber: number
  status: 'won' | 'lost' | 'ended'
  prizeWon: string
  playedAt: string
}

export interface SeatInfo {
  seatNumber: number
  isReserved: boolean
  isMine: boolean
}

export interface JoinedGame {
  gameId: string
  title: string
  prize: string
  prizeImageUrl?: string
  gameCode: string
  status: Game['status']
  mySeatNumber: number | null
  isWinner: boolean
  winners: Array<{
    seatNumber: number
    user: { _id: string; fullName: string; phone: string } | string
  }>
  joinedAt: string | null
}

export interface NotificationItem {
  _id: string
  userId: string
  title: string
  message: string
  isRead: boolean
  gameId?: string
  createdAt: string
  updatedAt: string
}

export interface NotificationsResult {
  notifications: NotificationItem[]
  unreadCount: number
}

export interface GameDetailsResult {
  game: Game
  seatMap: SeatInfo[]
  userReservedSeat: number | null
}

export interface Participant {
  _id: string
  seatNumber: number
  userId?:
    | { _id: string; fullName: string; phone: string; email: string }
    | string
  createdAt: string
}

export interface AdminStats {
  totalGames: number
  activeGames: number
  endedGames: number
  completedGames: number
  registeredUsers: number
  totalSeatsReserved: number
  totalWinners: number
}

export interface AdminAnalytics {
  stats: AdminStats
  engagement: Array<{ month: string; seats: number; games: number }>
  playerGrowth: Array<{ month: string; newPlayers: number; activeUsers: number }>
  gameDistribution: Array<{ name: string; value: number }>
  topGames: Array<{ name: string; seats: number; fillRate: number }>
}

export interface AdminHistoryEntry {
  _id: string
  gameId: string
  gameTitle: string
  gameCode: string
  prize: string
  prizeImageUrl?: string
  gameStatus: 'active' | 'ended' | 'completed'
  seatNumber: number
  userName: string
  userPhone: string
  userEmail: string
  isWinner: boolean
  createdAt: string
}
