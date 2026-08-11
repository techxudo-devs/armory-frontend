import type { Game } from '@/lib/api/gamesApi'
import type { FeaturedRaffle, Raffle, RaffleCategory } from '@/types'
import { RAFFLE_CATEGORIES } from '@/types'

export function gameCategory(game: Game): RaffleCategory {
  const candidate = (game.category ?? 'Accessories') as RaffleCategory
  return RAFFLE_CATEGORIES.includes(candidate) ? candidate : 'Accessories'
}

export function fillRatio(game: Game): number {
  if (!game.totalSeats) return 0
  return game.reservedSeatsCount / game.totalSeats
}

export function mapGameToRaffle(game: Game): Raffle {
  return {
    id: game._id,
    gameCode: game.gameCode,
    category: gameCategory(game),
    title: game.title,
    seatsTotal: game.totalSeats,
    seatsClaimed: game.reservedSeatsCount,
    urgent: fillRatio(game) >= 0.8,
    imageUrl: game.prizeImageUrl || undefined,
    endDate: game.endDate,
  }
}

export function mapGameToFeatured(game: Game): FeaturedRaffle {
  return {
    ...mapGameToRaffle(game),
    description:
      game.description ||
      `Reserve your seat for a chance to win ${game.prize}. Every seat is a real entry, drawn live once the board fills.`,
  }
}
