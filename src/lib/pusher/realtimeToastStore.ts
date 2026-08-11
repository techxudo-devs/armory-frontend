'use client'

export type RealtimeToastTone = 'success' | 'info' | 'warning'

export interface RealtimeToast {
  id: string
  title: string
  message: string
  tone: RealtimeToastTone
  link?: string
}

const MAX_STACK = 3
const DURATION_MS = 6000

let toasts: RealtimeToast[] = []
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

function scheduleRemove(id: string) {
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, DURATION_MS)
}

export function getRealtimeToasts(): RealtimeToast[] {
  return toasts
}

export function subscribeRealtimeToasts(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function addRealtimeToast(toast: Omit<RealtimeToast, 'id'>): void {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  toasts = [...toasts, { ...toast, id }].slice(-MAX_STACK)
  emit()
  scheduleRemove(id)
}

export function dismissRealtimeToast(id: string): void {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}
