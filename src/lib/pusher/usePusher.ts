'use client'

import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { baseApi } from '@/lib/api/baseApi'
import { getPusherClient } from '@/lib/pusher/client'
import { GAME_CREATED_EVENT, type GameCreatedPayload } from '@/lib/realtime/gameCreatedEvents'
import {
  addRealtimeToast,
  type RealtimeToastTone,
} from '@/lib/pusher/realtimeToastStore'

interface NotificationPayload {
  _id: string
  userId: string
  gameId?: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

function toneForTitle(title: string): RealtimeToastTone {
  if (/won|congratul/i.test(title)) return 'success'
  if (/approv/i.test(title)) return 'success'
  if (/reject|failed|expired/i.test(title)) return 'warning'
  return 'info'
}

/**
 * Live notifications for the signed-in user. Subscribes to `user-{userId}`
 * (targeted notifications) and `global-notifications` (broadcast ones).
 * New notifications invalidate the `Notifications` tag so the header badge
 * refreshes instantly, and a slide-in toast slides in from the top-right.
 */
export function usePusherNotifications({
  userId,
  enabled = true,
}: {
  userId?: string
  enabled?: boolean
}) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!enabled) return

    const invalidateGames = () => dispatch(baseApi.util.invalidateTags(['Game']))
    const onWindowEvent = () => invalidateGames()
    const onStorage = (event: StorageEvent) => {
      if (event.key === GAME_CREATED_EVENT) invalidateGames()
    }

    let channel: BroadcastChannel | null = null
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(GAME_CREATED_EVENT)
      channel.onmessage = (event: MessageEvent<GameCreatedPayload>) => {
        if (event.data) invalidateGames()
      }
    }

    window.addEventListener(GAME_CREATED_EVENT, onWindowEvent)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener(GAME_CREATED_EVENT, onWindowEvent)
      window.removeEventListener('storage', onStorage)
      channel?.close()
    }
  }, [enabled, dispatch])

  useEffect(() => {
    if (!enabled || !userId) return
    const pusher = getPusherClient()
    if (!pusher) return

    const invalidateNotifications = () =>
      dispatch(baseApi.util.invalidateTags(['Notifications']))
    const invalidateUserData = () =>
      dispatch(baseApi.util.invalidateTags(['Notifications', 'JoinedGames']))

    const globalChannel = pusher.subscribe('global-notifications')
    globalChannel.bind('notification:new', invalidateNotifications)
    globalChannel.bind('game:created', () => {
      dispatch(baseApi.util.invalidateTags(['Game']))
    })

    const userChannel = pusher.subscribe(`user-${userId}`)
    userChannel.bind('notification:new', (payload: NotificationPayload) => {
      invalidateUserData()
      if (payload?.title) {
        addRealtimeToast({
          title: payload.title,
          message: payload.message,
          tone: toneForTitle(payload.title),
          link: '/dashboard/notifications',
        })
      }
    })

    return () => {
      globalChannel.unbind_all()
      userChannel.unbind_all()
      pusher.unsubscribe('global-notifications')
      pusher.unsubscribe(`user-${userId}`)
    }
  }, [userId, enabled, dispatch])
}

/**
 * Live notifications for admins. Subscribes to `admin-channel` and shows a
 * slide-in toast when a player submits seats for approval.
 */
export function usePusherAdminNotifications({ enabled = true }: { enabled?: boolean }) {
  const dispatch = useDispatch()

  useEffect(() => {
    if (!enabled) return
    const pusher = getPusherClient()
    if (!pusher) return

    const channel = pusher.subscribe('admin-channel')
    channel.bind('seat-request:new', () => {
      dispatch(baseApi.util.invalidateTags(['PendingApprovals']))
      addRealtimeToast({
        title: 'New Seat Request',
        message: 'A player submitted seats for approval.',
        tone: 'warning',
        link: '/admin/approvals',
      })
    })
    channel.bind('feedback:new', (payload?: { subject?: string; user?: string }) => {
      dispatch(baseApi.util.invalidateTags(['Feedback']))
      addRealtimeToast({
        title: 'New Feedback',
        message: `${payload?.user ?? 'A player'} sent: ${payload?.subject ?? ''}`,
        tone: 'warning',
        link: '/admin/feedback',
      })
    })
    channel.bind('approval:updated', () => {
      dispatch(
        baseApi.util.invalidateTags(['PendingApprovals', 'Game', 'Analytics']),
      )
    })
    channel.bind('game:updated', () => {
      dispatch(
        baseApi.util.invalidateTags(['Game', 'Analytics', 'History', 'PendingApprovals']),
      )
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe('admin-channel')
    }
  }, [enabled, dispatch])
}

/**
 * Generic live invalidation hook. Subscribes to `channel` and runs
 * `onEvent(event, data)` whenever one of `events` fires. Returns `null`
 * when the channel is not ready yet (e.g. game still loading) or Pusher is
 * not configured.
 */
export function usePusherEvents(
  channel: string | null | undefined,
  events: string[],
  onEvent: (event: string, data: unknown) => void,
) {
  const handlerRef = useRef(onEvent)

  useEffect(() => {
    handlerRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!channel || events.length === 0) return
    const pusher = getPusherClient()
    if (!pusher) return

    const pusherChannel = pusher.subscribe(channel)
    const handlers = events.map((event) => {
      const fn = (data: unknown) => handlerRef.current(event, data)
      pusherChannel.bind(event, fn)
      return { event, fn }
    })

    return () => {
      handlers.forEach(({ event, fn }) => pusherChannel.unbind(event, fn))
      pusher.unsubscribe(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, events.join('|')])
}
