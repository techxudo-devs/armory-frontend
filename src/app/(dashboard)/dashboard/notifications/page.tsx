'use client'

import { useState } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, BellRing, Loader2, Trash2, RotateCcw, X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadNotificationsMutation,
} from '@/lib/api/userApi'
import { useReRequestSeatsMutation } from '@/lib/api/gamesApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import type { NotificationItem } from '@/lib/api/types'
import { Pagination } from '@/components/Pagination'

const getType = (title: string): 'success' | 'alert' | 'info' => {
  const t = title.toLowerCase()
  if (t.includes('won') || t.includes('congratul')) return 'success'
  if (t.includes('start') || t.includes('alert') || t.includes('reminder')) return 'alert'
  return 'info'
}

const typeStyles: Record<'success' | 'alert' | 'info', { chip: string; icon: React.ReactNode }> = {
  success: {
    chip: 'bg-emerald-500/10 text-emerald-400',
    icon: <CheckCircle size={18} />,
  },
  alert: {
    chip: 'bg-amber-500/10 text-amber-400',
    icon: <AlertCircle size={18} />,
  },
  info: {
    chip: 'bg-[#D29A45]/10 text-[#E3C49A]',
    icon: <Info size={18} />,
  },
}

const getTimestamp = (date: string) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const inputClass =
  'w-full rounded-xl border border-[#3D2715] bg-[#24140B] px-3.5 py-2.5 text-sm text-[#F4EADD] placeholder-[#9A7A5C] outline-none transition-colors duration-300 focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20'
const labelClass = 'mb-1.5 block text-sm font-medium text-[#C09A76]'

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 100 },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  )
  const [markNotificationRead] = useMarkNotificationReadMutation()
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation()
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation()
  const [deleteAllReadNotifications, { isLoading: isDeletingAll }] =
    useDeleteAllReadNotificationsMutation()
  const [reRequestSeats, { isLoading: isReRequesting }] = useReRequestSeatsMutation()
  const [notifPage, setNotifPage] = useState(1)
  const [reRequestModal, setReRequestModal] = useState<NotificationItem | null>(null)
  const [reRequestRef, setReRequestRef] = useState('')
  const [reRequestProof, setReRequestProof] = useState<File | null>(null)

  const notifications: NotificationItem[] = data?.notifications ?? []
  const unreadCount = data?.unreadCount ?? 0
  const readCount = notifications.length - unreadCount
  const pageSize = 10
  const notifTotalPages = Math.max(1, Math.ceil(notifications.length / pageSize))
  const pagedNotifications = notifications.slice(
    (notifPage - 1) * pageSize,
    notifPage * pageSize,
  )

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationRead(id).unwrap()
    } catch {
      toast.error('Failed to mark as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead().unwrap()
      toast.success('All notifications marked as read')
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap()
      toast.success('Notification deleted')
    } catch {
      toast.error('Failed to delete notification')
    }
  }

  const handleDeleteAllRead = async () => {
    try {
      await deleteAllReadNotifications().unwrap()
      toast.success('Read notifications deleted')
    } catch {
      toast.error('Failed to delete read notifications')
    }
  }

  const handleReRequest = async () => {
    if (!reRequestModal?.metadata?.gameId || !reRequestModal.metadata.seatNumbers) return
    if (!reRequestRef.trim() && !reRequestProof) {
      toast.error('Please provide a payment reference or upload a payment screenshot.')
      return
    }
    try {
      await reRequestSeats({
        gameId: reRequestModal.metadata.gameId,
        seatNumbers: reRequestModal.metadata.seatNumbers!,
        paymentReference: reRequestRef.trim() || reRequestModal.metadata.paymentReference || '',
        paymentProof: reRequestProof || undefined,
      }).unwrap()
      toast.success('Seats re-requested successfully! Awaiting admin approval.')
      await deleteNotification(reRequestModal._id).unwrap()
      setReRequestModal(null)
      setReRequestRef('')
      setReRequestProof(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const openReRequest = (notification: NotificationItem) => {
    setReRequestRef(notification.metadata?.paymentReference || '')
    setReRequestProof(null)
    setReRequestModal(notification)
  }

  const isRejection = (n: NotificationItem) =>
    n.title.toLowerCase().includes('rejected') && n.metadata?.seatNumbers && n.metadata?.gameId

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with the latest game activities.</p>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#D29A45]/30 bg-[#D29A45]/10 px-4 py-2 text-sm font-semibold text-[#E3C49A]">
              <BellRing size={16} />
              {unreadCount} Unread
            </span>
          )}
        </div>
      </div>

      {!isLoading && notifications.length > 0 && (
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#D29A45]" />
            <span className="text-sm font-medium text-[#C09A76]">
              {notifications.length} notification{notifications.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <button
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0 || isMarkingAll}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#3D2715] bg-[#24140B] px-4 py-2 text-sm font-medium text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-[#F4EADD] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isMarkingAll && <Loader2 size={14} className="animate-spin" />}
              Mark all read
            </button>
            <button
              onClick={handleDeleteAllRead}
              disabled={readCount === 0 || isDeletingAll}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-orange-600/20 bg-orange-600/10 px-4 py-2 text-sm font-medium text-amber-500 transition-colors duration-300 hover:bg-orange-600/20 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDeletingAll && <Loader2 size={14} className="animate-spin" />}
              Delete read
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[100px] animate-pulse rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B]"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] py-16 text-center shadow-xl shadow-black/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <Bell className="text-[#C09A76] opacity-60" size={28} />
            </div>
            <p className="text-lg font-semibold text-[#F4EADD]">No notifications yet</p>
            <p className="mt-2 text-sm text-[#C09A76]">You&apos;ll see updates here</p>
          </div>
        ) : (
          pagedNotifications.map((notification) => {
            const style = typeStyles[getType(notification.title)]
            const showReRequest = isRejection(notification)
            return (
              <div
                key={notification._id}
                className={`rounded-2xl border bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20 transition-colors duration-300 ${
                  notification.isRead ? 'border-[#3D2715]' : 'border-[#D29A45]/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.chip}`}
                  >
                    {style.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-semibold text-[#F4EADD]">{notification.title}</h3>
                          {!notification.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-[#D29A45]" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-[#C09A76]">{notification.message}</p>
                        <p className="mt-2 text-xs font-medium text-[#9A7A5C]">
                          {getTimestamp(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#3D2715] bg-[#24140B] text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45]/10 hover:text-[#E3C49A]"
                            title="Mark as read"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {notification.isRead && (
                          <button
                            onClick={() => handleDelete(notification._id)}
                            disabled={isDeleting}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#3D2715] bg-[#24140B] text-[#9A7A5C] transition-colors duration-300 hover:border-orange-600/30 hover:bg-orange-600/10 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                            title="Delete notification"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    {showReRequest && (
                      <button
                        onClick={() => openReRequest(notification)}
                        className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-[#D29A45]/30 bg-[#D29A45]/10 px-4 py-2 text-sm font-semibold text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45]/20"
                      >
                        <RotateCcw size={14} />
                        Request Again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {notifications.length > 0 && (
        <Pagination
          page={notifPage}
          totalPages={notifTotalPages}
          totalDocs={notifications.length}
          pageSize={pageSize}
          onPageChange={(p) => setNotifPage(Math.min(notifTotalPages, p))}
          label="notifications"
        />
      )}

      {/* Re-request modal */}
      {reRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#3D2715] bg-[#24140B] p-6 text-[#F4EADD] shadow-2xl shadow-black/60">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D29A45]/10">
                  <RotateCcw className="text-[#E3C49A]" size={20} />
                </div>
                <h2 className="text-lg font-semibold tracking-wide">Request Seats Again</h2>
              </div>
              <button
                onClick={() => setReRequestModal(null)}
                disabled={isReRequesting}
                className="cursor-pointer rounded-lg p-1.5 text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-[#F4EADD]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-[#3D2715] bg-[#24140B]/60 px-4 py-3">
              <p className="text-xs text-[#C09A76]">
                Game: <span className="font-semibold text-[#F4EADD]">{reRequestModal.metadata?.gameTitle}</span>
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[#C09A76]">Seats:</span>
                {reRequestModal.metadata?.seatNumbers?.map((n) => (
                  <span
                    key={n}
                    className="inline-flex items-center rounded-lg bg-[#D29A45]/10 px-2 py-0.5 text-xs font-bold text-[#E3C49A]"
                  >
                    #{n}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="reRequestRef" className={labelClass}>
                  Payment Reference *
                </label>
                <input
                  id="reRequestRef"
                  type="text"
                  value={reRequestRef}
                  onChange={(e) => setReRequestRef(e.target.value)}
                  className={inputClass}
                  placeholder="Enter payment reference"
                />
              </div>
              <div>
                <label htmlFor="reRequestProof" className={labelClass}>
                  Payment Screenshot
                </label>
                <label
                  htmlFor="reRequestProof"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#3D2715] bg-[#24140B] px-3.5 py-3 text-sm text-[#C09A76] transition-colors duration-300 hover:border-[#D29A45] hover:text-[#E3C49A]"
                >
                  <ImageIcon size={18} className="shrink-0" />
                  <span className="truncate">
                    {reRequestProof ? reRequestProof.name : 'Upload payment screenshot (optional)'}
                  </span>
                </label>
                <input
                  id="reRequestProof"
                  name="reRequestProof"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReRequestProof(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setReRequestModal(null)}
                disabled={isReRequesting}
                className="flex-1 cursor-pointer rounded-xl border border-[#3D2715] px-4 py-2.5 text-sm font-medium text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-[#F4EADD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReRequest}
                disabled={isReRequesting}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isReRequesting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isReRequesting ? 'Submitting...' : 'Request Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
