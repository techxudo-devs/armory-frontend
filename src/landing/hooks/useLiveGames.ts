'use client'

import { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useGetPublicGamesQuery } from '@/lib/api/gamesApi'
import type { Game } from '@/lib/api/gamesApi'
import { baseApi } from '@/lib/api/baseApi'
import { getPusherClient } from '@/lib/pusher/client'

/**
 * Fetches live (active) games from the backend and keeps seat counts in
 * sync in real time by subscribing to each game's `seat-map:updated` events.
 */
export function useLiveGames(limit = 12) {
  const dispatch = useDispatch()
  const { data, isLoading } = useGetPublicGamesQuery({ page: 1, limit })
  const games: Game[] = useMemo(() => data?.items ?? [], [data])
  const channelKey = games.map((g) => g._id).join('|')

  useEffect(() => {
    if (!games.length) return
    const pusher = getPusherClient()
    if (!pusher) return

    const invalidate = () => dispatch(baseApi.util.invalidateTags(['Game']))
    const channels = games.map((g) => pusher.subscribe(`game-${g._id}`))
    channels.forEach((ch) => ch.bind('seat-map:updated', invalidate))

    return () => {
      channels.forEach((ch) => {
        ch.unbind('seat-map:updated', invalidate)
        pusher.unsubscribe(ch.name)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelKey, dispatch])

  return { games, isLoading }
}
