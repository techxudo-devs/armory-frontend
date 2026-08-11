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
      <div className="w-full max-w-md rounded-2xl border border-[#3D2715] bg-[#24140B] p-6 text-[#F4EADD] shadow-2xl shadow-black/60">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600/10">
              <AlertCircle className="text-amber-500" size={20} />
            </div>
            <h2 className="text-lg font-semibold tracking-wide">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-lg p-1.5 text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-[#F4EADD]"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mb-6 text-sm text-[#C09A76]">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 cursor-pointer rounded-xl border border-[#3D2715] px-4 py-2.5 text-sm font-medium text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-[#F4EADD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition-all duration-300 hover:from-orange-700 hover:to-orange-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
