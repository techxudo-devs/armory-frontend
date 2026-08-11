'use client'

import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import {
  dismissRealtimeToast,
  getRealtimeToasts,
  subscribeRealtimeToasts,
  type RealtimeToast,
  type RealtimeToastTone,
} from '@/lib/pusher/realtimeToastStore'

const toneStyles: Record<RealtimeToastTone, { border: string; bar: string }> = {
  success: { border: 'border-emerald-500', bar: 'bg-emerald-500' },
  info: { border: 'border-sky-500', bar: 'bg-sky-500' },
  warning: { border: 'border-amber-500', bar: 'bg-amber-500' },
}

export function RealtimeToasts() {
  const router = useRouter()
  const pathname = usePathname()
  const toasts = useSyncExternalStore(subscribeRealtimeToasts, getRealtimeToasts, getRealtimeToasts)

  if (pathname?.endsWith('/notifications') || toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-[22rem] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissRealtimeToast(toast.id)}
          onClick={() => {
            if (toast.link) router.push(toast.link)
          }}
        />
      ))}
    </div>
  )
}

function ToastCard({
  toast,
  onDismiss,
  onClick,
}: {
  toast: RealtimeToast
  onDismiss: () => void
  onClick: () => void
}) {
  const tone = toneStyles[toast.tone]

  return (
    <div
      role="status"
      onClick={onClick}
      className={`relative animate-toast-in cursor-pointer overflow-hidden rounded-2xl border-l-4 ${tone.border} bg-[#14171B]/95 shadow-2xl shadow-black/50 backdrop-blur`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#F2F3F5]">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-sm leading-snug text-[#9AA0AA]">{toast.message}</p>
          )}
        </div>
        <button
          aria-label="Dismiss notification"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="shrink-0 rounded-lg p-1 text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5]"
        >
          <X size={15} />
        </button>
      </div>
      <div
        className={`h-0.5 w-full ${tone.bar} animate-toast-progress origin-left`}
        style={{ animationDuration: '6000ms' }}
      />
    </div>
  )
}
