'use client'

import { useState } from 'react'
import { Loader2, MessageSquareText, Send, CheckCircle2, AlertCircle, HelpCircle, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { useSubmitFeedbackMutation, useGetMyFeedbackQuery } from '@/lib/api/feedbackApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import type { FeedbackType } from '@/lib/api/types'
import { Pagination } from '@/components/Pagination'

const TYPE_OPTIONS: Array<{ value: FeedbackType; label: string; icon: React.ReactNode }> = [
  { value: 'complaint', label: 'Complaint', icon: <AlertCircle size={15} /> },
  { value: 'good_word', label: 'Good Word', icon: <CheckCircle2 size={15} /> },
  { value: 'question', label: 'Question', icon: <HelpCircle size={15} /> },
  { value: 'suggestion', label: 'Suggestion', icon: <Lightbulb size={15} /> },
]

const TYPE_LABELS: Record<FeedbackType, string> = {
  complaint: 'Complaint',
  good_word: 'Good Word',
  question: 'Question',
  suggestion: 'Suggestion',
}

const STATUS_STYLES: Record<string, { chip: string; label: string }> = {
  new: { chip: 'bg-amber-500/10 text-amber-400', label: 'New' },
  in_review: { chip: 'bg-[#D29A45]/10 text-[#E3C49A]', label: 'In Review' },
  resolved: { chip: 'bg-emerald-500/10 text-emerald-400', label: 'Resolved' },
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

export default function FeedbackPage() {
  const [type, setType] = useState<FeedbackType>('complaint')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation()
  const { data, isLoading } = useGetMyFeedbackQuery({ page: 1, limit: 100 })
  const [fbPage, setFbPage] = useState(1)

  const items = data?.items ?? []
  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const pagedItems = items.slice((fbPage - 1) * pageSize, fbPage * pageSize)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both subject and message.')
      return
    }
    try {
      await submitFeedback({ type, subject: subject.trim(), message: message.trim() }).unwrap()
      toast.success('Feedback submitted. The team has been notified.')
      setSubject('')
      setMessage('')
      setType('complaint')
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  const inputBase =
    'w-full rounded-xl border border-[#3D2715] bg-[#331E10] px-3.5 py-2.5 text-sm text-[#F4EADD] outline-none transition-colors duration-300 placeholder:text-[#9A7A5C] focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20'

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Feedback & Support</h1>
        <p className="text-muted-foreground">
          Have an issue, a question, or just want to say something nice? Let us know.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Submit form */}
        <form
          onSubmit={handleSubmit}
          className="h-fit rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D29A45]/10">
              <MessageSquareText size={20} className="text-[#E3C49A]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#F4EADD]">Send a message</h2>
              <p className="text-xs text-[#C09A76]">It goes straight to the admin team.</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#C09A76]">
              Type <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors duration-300 ${
                    type === option.value
                      ? 'border-[#D29A45] bg-[#D29A45]/15 text-[#E3C49A]'
                      : 'border-[#3D2715] bg-[#24140B] text-[#C09A76] hover:bg-white/5'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="feedback-subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#C09A76]">
              Subject <span className="text-amber-500">*</span>
            </label>
            <input
              id="feedback-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={120}
              placeholder="Short summary of your message"
              className={inputBase}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="feedback-message" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#C09A76]">
              Message <span className="text-amber-500">*</span>
              <span className="ml-2 font-normal normal-case text-[#9A7A5C]">{message.length}/2000</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={2000}
              rows={5}
              placeholder="Tell us what happened, ask a question, or share a good word..."
              className={`${inputBase} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-4 py-3 text-sm font-bold text-[#1a1408] shadow-lg shadow-[#D29A45]/20 transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Feedback
          </button>
        </form>

        {/* My submissions */}
        <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
              <CheckCircle2 size={20} className="text-[#C09A76]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#F4EADD]">My submissions</h2>
              <p className="text-xs text-[#C09A76]">Track the status of your messages.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-[92px] animate-pulse rounded-xl border border-[#3D2715] bg-[#24140B]" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-[#3D2715] bg-[#24140B] py-12 text-center">
              <MessageSquareText className="mx-auto mb-3 text-[#C09A76] opacity-60" size={26} />
              <p className="text-sm font-semibold text-[#F4EADD]">No submissions yet</p>
              <p className="mt-1 text-xs text-[#C09A76]">Your messages will appear here.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {pagedItems.map((item) => {
                  const status = STATUS_STYLES[item.status] ?? STATUS_STYLES.new
                  return (
                    <div key={item._id} className="rounded-xl border border-[#3D2715] bg-[#24140B]/60 p-4">
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-[#F4EADD]">{item.subject}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${status.chip}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mb-2 text-xs leading-relaxed text-[#C09A76]">{item.message}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9A7A5C]">
                          {TYPE_LABELS[item.type] ?? item.type}
                        </span>
                        <span className="text-[10px] font-medium text-[#9A7A5C]">{getTimestamp(item.createdAt)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {items.length > pageSize && (
                <Pagination
                  page={fbPage}
                  totalPages={totalPages}
                  totalDocs={items.length}
                  pageSize={pageSize}
                  onPageChange={(p) => setFbPage(Math.min(totalPages, p))}
                  label="submissions"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
