'use client'

import { useState } from 'react'
import {
  Inbox,
  Loader2,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetFeedbackQuery,
  useGetFeedbackCountsQuery,
  useUpdateFeedbackStatusMutation,
  useDeleteFeedbackMutation,
} from '@/lib/api/feedbackApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import type { FeedbackItem, FeedbackStatus, FeedbackType } from '@/lib/api/types'
import { Pagination } from '@/components/Pagination'

type Tab = 'all' | FeedbackStatus

const TYPE_META: Record<FeedbackType, { label: string; icon: React.ReactNode; chip: string }> = {
  complaint: { label: 'Complaint', icon: <AlertCircle size={13} />, chip: 'bg-orange-600/10 text-amber-500' },
  good_word: { label: 'Good Word', icon: <ThumbsUp size={13} />, chip: 'bg-emerald-500/10 text-emerald-400' },
  question: { label: 'Question', icon: <HelpCircle size={13} />, chip: 'bg-sky-500/10 text-sky-400' },
  suggestion: { label: 'Suggestion', icon: <Lightbulb size={13} />, chip: 'bg-[#D29A45]/10 text-[#E3C49A]' },
}

const TABS: Array<{ key: Tab; label: string }> = [
  { key: 'new', label: 'New' },
  { key: 'in_review', label: 'In Review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'all', label: 'All' },
]

const getTimestamp = (date: string) =>
  new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

export default function FeedbackInboxPage() {
  const [tab, setTab] = useState<Tab>('new')
  const [page, setPage] = useState(1)
  const [updateStatus, { isLoading: isUpdating }] = useUpdateFeedbackStatusMutation()
  const [deleteFeedback, { isLoading: isDeleting }] = useDeleteFeedbackMutation()

  const { data, isLoading, isFetching } = useGetFeedbackQuery({
    page,
    limit: 10,
    status: tab === 'all' ? undefined : tab,
  })
  const { data: counts } = useGetFeedbackCountsQuery()

  const items = data?.items ?? []
  const pagination = data?.pagination

  const handleStatus = async (item: FeedbackItem, status: FeedbackStatus) => {
    try {
      await updateStatus({ id: item._id, status }).unwrap()
      toast.success(status === 'resolved' ? 'Marked as resolved. The user has been notified.' : 'Status updated.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFeedback(id).unwrap()
      toast.success('Feedback deleted.')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const tabCount = (key: Tab) => {
    if (!counts) return undefined
    if (key === 'all') return counts.new + counts.inReview + counts.resolved
    if (key === 'in_review') return counts.inReview
    return counts[key]
  }

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl md:flex hidden bg-[#D29A45]/10">
            <Inbox size={22} className="text-[#E3C49A]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Feedback Inbox</h1>
            <p className="text-muted-foreground">
              Complaints, questions and good words sent by players.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key)
              setPage(1)
            }}
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
              tab === t.key
                ? 'border-[#D29A45] bg-[#D29A45]/15 text-[#E3C49A]'
                : 'border-[#3D2715] bg-[#24140B] text-[#C09A76] hover:bg-white/5'
            }`}
          >
            {t.label}
            {tabCount(t.key) !== undefined && tabCount(t.key)! > 0 && (
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  tab === t.key ? 'bg-[#1a1408] text-[#D29A45]' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {tabCount(t.key)}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[150px] animate-pulse rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] py-16 text-center shadow-xl shadow-black/20">
          <Inbox className="mx-auto mb-4 text-[#C09A76] opacity-60" size={32} />
          <p className="text-lg font-semibold text-[#F4EADD]">No feedback here</p>
          <p className="mt-2 text-sm text-[#C09A76]">
            New submissions from players will show up instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const type = TYPE_META[item.type] ?? TYPE_META.complaint
            return (
              <div
                key={item._id}
                className={`rounded-2xl border bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20 ${
                  item.status === 'new' ? 'border-amber-500/25' : 'border-[#3D2715]'
                }`}
              >
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                      <User size={18} className="text-[#E3C49A]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#F4EADD]">{item.user?.fullName ?? 'Unknown user'}</p>
                      <p className="mt-0.5 truncate text-xs text-[#C09A76]">
                        {item.user?.email}
                        {item.user?.phone ? ` · ${item.user.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${type.chip}`}>
                      {type.icon}
                      {type.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#C09A76]">
                      <Clock size={11} />
                      {getTimestamp(item.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-[#3D2715] bg-[#24140B]/60 p-4">
                  <p className="mb-1 font-semibold text-[#F4EADD]">{item.subject}</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-[#C09A76]">{item.message}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {item.status === 'new' && (
                    <>
                      <button
                        onClick={() => handleStatus(item, 'in_review')}
                        disabled={isUpdating || isDeleting}
                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#D29A45]/10 px-3.5 py-2 text-xs font-semibold text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45]/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Eye size={14} />
                        Mark In Review
                      </button>
                      <button
                        onClick={() => handleStatus(item, 'resolved')}
                        disabled={isUpdating || isDeleting}
                        className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 transition-colors duration-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Resolve
                      </button>
                    </>
                  )}
                  {item.status === 'in_review' && (
                    <button
                      onClick={() => handleStatus(item, 'resolved')}
                      disabled={isUpdating || isDeleting}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 transition-colors duration-300 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={isUpdating || isDeleting}
                    className="ml-auto flex cursor-pointer items-center gap-2 rounded-xl border border-orange-600/20 bg-orange-600/10 px-3.5 py-2 text-xs font-semibold text-amber-500 transition-colors duration-300 hover:bg-orange-600/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {pagination && pagination.totalDocs > 0 && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            totalDocs={pagination.totalDocs}
            pageSize={pagination.limit}
            isFetching={isFetching}
            onPageChange={(p) => setPage(p)}
            label="submissions"
          />
        </div>
      )}
    </div>
  )
}
