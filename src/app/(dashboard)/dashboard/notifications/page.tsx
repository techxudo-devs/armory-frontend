'use client'

import { useState } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, BellRing, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadNotificationsMutation,
} from '@/lib/api/userApi'
// import { useAutoRefetch } from '@/lib/tanstack/useAutoRefetch'
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

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 100 },
    {
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  )
  // useAutoRefetch({ queryKey: ['notifications', 'page'], refetch })
  const [markNotificationRead] = useMarkNotificationReadMutation()
  const [markAllNotificationsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation()
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation()
  const [deleteAllReadNotifications, { isLoading: isDeletingAll }] =
    useDeleteAllReadNotificationsMutation()
  const [notifPage, setNotifPage] = useState(1)

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
                      {!notification.isRead ? (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#3D2715] bg-[#24140B] text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45]/10 hover:text-[#E3C49A]"
                          title="Mark as read"
                        >
                          <CheckCircle size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(notification._id)}
                          disabled={isDeleting}
                          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#3D2715] bg-[#24140B] text-[#9A7A5C] transition-colors duration-300 hover:border-orange-600/30 hover:bg-orange-600/10 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Delete notification"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
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
    </div>
  )
}
