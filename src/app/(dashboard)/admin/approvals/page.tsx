'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  Gamepad2,
  Loader2,
  Maximize2,
  Ticket,
  User,
  X,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useApprovePendingSeatsMutation,
  useGetPendingApprovalsQuery,
  useRejectPendingSeatsMutation,
} from '@/lib/api/gamesApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import type { PendingApproval } from '@/lib/api/types'

type ConfirmAction = { type: 'approve' | 'reject'; group: PendingApproval } | null

export default function PendingApprovalsPage() {
  const { data: approvals, isLoading, isError } = useGetPendingApprovalsQuery(undefined)
  const [approveSeats, { isLoading: isApproving }] = useApprovePendingSeatsMutation()
  const [rejectSeats, { isLoading: isRejecting }] = useRejectPendingSeatsMutation()
  const [confirm, setConfirm] = useState<ConfirmAction>(null)
  const [busyGroup, setBusyGroup] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const groups = approvals ?? []
  const totalSeats = groups.reduce((acc, g) => acc + g.total, 0)

  const handleApprove = async (group: PendingApproval) => {
    setBusyGroup(group.userId)
    try {
      await approveSeats(group.seats.map((s) => s.seatId)).unwrap()
      toast.success(
        `Approved ${group.total} seat${group.total > 1 ? 's' : ''} for ${group.user.fullName}.`,
      )
      setConfirm(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusyGroup(null)
    }
  }

  const handleReject = async (group: PendingApproval) => {
    setBusyGroup(group.userId)
    try {
      await rejectSeats(group.seats.map((s) => s.seatId)).unwrap()
      toast.success(
        `Rejected ${group.total} seat${group.total > 1 ? 's' : ''} for ${group.user.fullName}.`,
      )
      setConfirm(null)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setBusyGroup(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Seat Approvals</h1>
        <p className="text-muted-foreground">
          Verify payments and approve or reject pending seat reservations.
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <Clock size={20} className="text-[#FDBA74]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#9AA0AA]">Pending Requests</p>
            <p className="mt-0.5 text-2xl font-bold text-[#F2F3F5]">
              {isLoading ? '—' : groups.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
            <Ticket size={20} className="text-[#E68078]" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#9AA0AA]">Seats Awaiting Approval</p>
            <p className="mt-0.5 text-2xl font-bold text-[#F2F3F5]">
              {isLoading ? '—' : totalSeats}
            </p>
          </div>
        </div>
      </div>

      {/* Requests */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] animate-pulse rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B]"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] py-14 text-center shadow-xl shadow-black/20">
          <p className="text-sm text-[#9AA0AA]">Failed to load pending approvals.</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] py-14 text-center shadow-xl shadow-black/20">
          <CheckCircle2 className="mx-auto mb-3 text-[#6EE7B7] opacity-60" size={28} />
          <p className="font-semibold text-[#F2F3F5]">No pending approvals</p>
          <p className="mt-1 text-sm text-[#9AA0AA]">
            New seat reservations will show up here for verification.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div
              key={`${group.userId}-${group.gameId}`}
              className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E53535]/10">
                    <User size={18} className="text-[#E68078]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#F2F3F5]">{group.user.fullName}</p>
                    <p className="mt-0.5 text-xs text-[#9AA0AA]">
                      {group.user.email}
                      {group.user.phone ? ` · ${group.user.phone}` : ''}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#9AA0AA]">
                      <Clock size={12} />
                      Reserved{' '}
                      {new Date(group.reservedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                  {group.total} seat{group.total > 1 ? 's' : ''} pending
                </span>
              </div>

              <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[#23272D] bg-[#14171B] px-4 py-3 sm:flex-row sm:items-center sm:gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Gamepad2 size={15} className="shrink-0 text-[#E53535]" />
                  <span className="min-w-0 truncate text-sm font-semibold text-[#F2F3F5]">
                    {group.game.title}
                  </span>
                  <span className="shrink-0 rounded bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#9AA0AA]">
                    {group.game.gameCode}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#FDBA74] sm:ml-auto">
                  {group.game.prize}
                </span>
              </div>

              <div className="mb-5 space-y-2">
                {group.seats.map((seat) => (
                  <div
                    key={seat.seatId}
                    className="flex flex-col gap-1 rounded-xl border border-[#23272D] bg-[#14171B]/60 px-4 py-3 sm:flex-row sm:items-center sm:gap-3"
                  >
                    <span className="inline-flex w-fit items-center rounded-lg bg-[#E53535]/10 px-2.5 py-1 text-xs font-bold text-[#E68078]">
                      Seat #{seat.seatNumber}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-xs text-[#9AA0AA]">
                          <span className="text-[#9AA0AA]">Reference:</span>{' '}
                          {seat.paymentReference || (
                            <span className="italic text-[#5C636D]">not provided</span>
                          )}
                        </span>
                        {seat.paymentProof && (
                          <button
                            onClick={() => setLightbox(seat.paymentProof)}
                            title="View payment screenshot"
                            className="group relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-[#23272D] transition-transform hover:scale-105"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={seat.paymentProof}
                              alt="Payment screenshot"
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                              <Maximize2 size={14} className="text-white" />
                            </span>
                          </button>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-[#5C636D]">
                        {new Date(seat.reservedAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirm({ type: 'approve', group })}
                  disabled={busyGroup === group.userId}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyGroup === group.userId && isApproving && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  <CheckCircle2 size={16} />
                  Approve
                </button>
                <button
                  onClick={() => setConfirm({ type: 'reject', group })}
                  disabled={busyGroup === group.userId}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#23272D] bg-[#14171B] p-6 text-[#F2F3F5] shadow-2xl shadow-black/60">
            <div className="mb-6 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  confirm.type === 'approve' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}
              >
                {confirm.type === 'approve' ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <XCircle className="text-red-400" size={20} />
                )}
              </div>
              <h2 className="text-lg font-semibold tracking-wide">
                {confirm.type === 'approve' ? 'Approve reservation' : 'Reject reservation'}
              </h2>
            </div>

            <p className="mb-6 text-sm text-[#9AA0AA]">
              {confirm.type === 'approve'
                ? `Approve ${confirm.group.total} seat${confirm.group.total > 1 ? 's' : ''} for ${confirm.group.user.fullName} in "${confirm.group.game.title}"? The user will be notified and the seats will become confirmed.`
                : `Reject ${confirm.group.total} seat${confirm.group.total > 1 ? 's' : ''} for ${confirm.group.user.fullName} in "${confirm.group.game.title}"? The seats will be released and the user will be notified.`}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                disabled={isApproving || isRejecting}
                className="flex-1 cursor-pointer rounded-xl border border-[#23272D] px-4 py-2.5 text-sm font-medium text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  confirm.type === 'approve'
                    ? handleApprove(confirm.group)
                    : handleReject(confirm.group)
                }
                disabled={isApproving || isRejecting}
                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                  confirm.type === 'approve'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:from-emerald-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25 hover:from-red-600 hover:to-red-700'
                }`}
              >
                {(isApproving || isRejecting) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                {confirm.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment screenshot lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="flex h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-[#23272D] bg-[#14171B] shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#23272D] px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-[#E68078]" />
                <h2 className="text-sm font-semibold tracking-wide text-[#F2F3F5]">
                  Payment screenshot
                </h2>
              </div>
              <button
                onClick={() => setLightbox(null)}
                title="Close"
                className="cursor-pointer rounded-lg p-1.5 text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox}
                alt="Payment screenshot"
                className="max-h-full max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
