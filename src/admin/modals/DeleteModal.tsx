'use client'

import { AlertCircle, Loader2, X } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function DeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[#23272D] bg-[#14171B] p-6 text-[#F2F3F5] shadow-2xl shadow-black/60">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle className="text-red-400" size={20} />
            </div>
            <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg p-1.5 text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-6 text-sm text-[#9AA0AA]">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl border border-[#23272D] px-4 py-2.5 text-sm font-medium text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-600 hover:to-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
