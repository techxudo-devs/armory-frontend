'use client'

export interface GameCreatedPayload {
  gameId?: string
  gameCode?: string
  title?: string
  prize?: string
  createdAt?: string
}

export const GAME_CREATED_EVENT = 'armory:game-created'

export function publishGameCreated(payload: GameCreatedPayload = {}) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(new CustomEvent<GameCreatedPayload>(GAME_CREATED_EVENT, { detail: payload }))

  if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel(GAME_CREATED_EVENT)
    channel.postMessage(payload)
    channel.close()
  }

  localStorage.setItem(
    GAME_CREATED_EVENT,
    JSON.stringify({ ...payload, publishedAt: Date.now() }),
  )
}

