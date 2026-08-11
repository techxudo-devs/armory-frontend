'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ImageIcon, Loader2 } from 'lucide-react'
import { Game } from '@/lib/api/gamesApi'
import { useForm } from '@/hooks/useForm'

interface GameModalProps {
  isOpen: boolean
  type: 'create' | 'edit' | 'view' | null
  game?: Game
  onClose: () => void
  onSubmit: (data: Partial<Game> & { prizeImage?: File | null }) => void
  isLoading?: boolean
}

const initialGameState: Partial<Game> = {
  title: '',
  gameCode: '',
  prize: '',
  description: '',
  rules: '',
  totalSeats: 100,
  numberOfWinners: 1,
  category: 'Accessories',
  status: 'active',
  endType: 'manual',
  endDate: null,
}

const inputClass =
  'w-full rounded-xl border border-[#2E1C0E] bg-[#1B0F08] px-3.5 py-2.5 text-sm text-[#F2E8DC] placeholder-[#8A6A50] outline-none transition-colors duration-300 focus:border-[#C78C3A] focus:ring-2 focus:ring-[#C78C3A]/20 disabled:opacity-50 disabled:cursor-not-allowed'
const labelClass = 'mb-1.5 block text-sm font-medium text-[#B08A6C]'

const toDateTimeLocal = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function GameModal({ isOpen, type, game, onClose, onSubmit, isLoading = false }: GameModalProps) {
  const resetRef = useRef<() => void>(() => {})
  const [prizeImage, setPrizeImage] = useState<File | null>(null)

  const handleClose = () => {
    setPrizeImage(null)
    onClose()
  }

  const { values, handleChange, handleSubmit, reset, setValues } = useForm<Partial<Game>>(
    initialGameState,
    (data) => {
      onSubmit({ ...data, prizeImage })
    }
  )
  useEffect(() => {
    resetRef.current = reset
  }, [reset])

  useEffect(() => {
    if (isOpen && type) {
      setValues(type !== 'create' && game ? game : initialGameState)
    }
  }, [isOpen, type, game, setValues])

  if (!isOpen || !type) return null

  const isViewOnly = type === 'view'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-[#2E1C0E] bg-[#1B0F08] p-5 text-[#F2E8DC] shadow-2xl shadow-black/60">
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <h2 className="text-lg font-semibold tracking-wide">
            {type === 'create' && 'Create New Game'}
            {type === 'edit' && 'Edit Game'}
            {type === 'view' && 'Game Details'}
          </h2>
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-lg p-1.5 text-[#B08A6C] transition-colors duration-300 hover:bg-white/5 hover:text-[#F2E8DC]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className={labelClass}>
                Game Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={values.title || ''}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={inputClass}
                placeholder="Enter game title"
                required
              />
            </div>
            {(type === 'edit' || type === 'view') && (
              <div>
                <label htmlFor="gameCode" className={labelClass}>
                  Game Code
                </label>
                <input
                  id="gameCode"
                  type="text"
                  name="gameCode"
                  value={values.gameCode || ''}
                  onChange={handleChange}
                  disabled
                  className={inputClass}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prize" className={labelClass}>
                Prize / Gift Name *
              </label>
              <input
                id="prize"
                type="text"
                name="prize"
                value={values.prize || ''}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={inputClass}
                placeholder="e.g. iPhone 16 Pro Max"
                required
              />
            </div>
            <div>
              <label htmlFor="prizeImage" className={labelClass}>
                Prize Image
              </label>
              {!isViewOnly && (
                <label
                  htmlFor="prizeImage"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#2E1C0E] bg-[#1B0F08] px-3.5 py-2.5 text-sm text-[#B08A6C] transition-colors duration-300 hover:border-[#C78C3A] hover:text-[#D0AE95]"
                >
                  <ImageIcon size={18} className="shrink-0" />
                  <span className="truncate">
                    {prizeImage
                      ? prizeImage.name
                      : values.prizeImageUrl
                        ? 'Current image set - choose new file to replace'
                        : 'Upload prize image (JPEG/PNG, max 5MB)'}
                  </span>
                </label>
              )}
              <input
                id="prizeImage"
                name="prizeImage"
                type="file"
                accept="image/*"
                disabled={isViewOnly || isLoading}
                onChange={(e) => setPrizeImage(e.target.files?.[0] || null)}
                className="hidden"
              />
              {values.prizeImageUrl && (type === 'edit' || type === 'view') && (
                <Image
                  src={values.prizeImageUrl}
                  alt="Prize"
                  width={64}
                  height={64}
                  className="mt-2 h-16 w-16 rounded-lg border border-[#2E1C0E] object-cover"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalSeats" className={labelClass}>
                Total Seats *
              </label>
              <input
                id="totalSeats"
                type="number"
                name="totalSeats"
                value={values.totalSeats || 100}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={inputClass}
                placeholder="e.g. 20, 50, 100"
                min={1}
                required
              />
            </div>
            <div>
              <label htmlFor="numberOfWinners" className={labelClass}>
                Number of Winners *
              </label>
              <input
                id="numberOfWinners"
                type="number"
                name="numberOfWinners"
                value={values.numberOfWinners || 1}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={inputClass}
                placeholder="e.g. 1"
                min={1}
                max={Math.max(1, Number(values.totalSeats) || 1)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={labelClass}>
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={values.category || 'Accessories'}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Knives">Knives</option>
                <option value="Optics">Optics</option>
                <option value="Ammo">Ammo</option>
                <option value="Accessories">Accessories</option>
                <option value="Firearms">Firearms</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="endType" className={labelClass}>
                End Type *
              </label>
              <select
                id="endType"
                name="endType"
                value={values.endType || 'manual'}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="manual">Manual End</option>
                <option value="automatic">Automatic End</option>
              </select>
            </div>
            {(type === 'edit' || type === 'view') && (
              <div>
                <label htmlFor="status" className={labelClass}>
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={values.status || 'active'}
                  onChange={handleChange}
                  disabled={isViewOnly || isLoading}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="active">Active</option>
                  <option value="ended">Ended</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          {values.endType === 'automatic' && (
            <div className="max-w-xs">
              <label htmlFor="endDate" className={labelClass}>
                End Date &amp; Time *
              </label>
              <input
                id="endDate"
                type="datetime-local"
                name="endDate"
                value={values.endDate ? toDateTimeLocal(values.endDate) : ''}
                onChange={handleChange}
                disabled={isViewOnly || isLoading}
                className={inputClass}
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description || ''}
              onChange={handleChange}
              disabled={isViewOnly || isLoading}
              className={inputClass}
              rows={3}
              placeholder="Enter game description"
            />
          </div>

          <div>
            <label htmlFor="rules" className={labelClass}>
              Rules
            </label>
            <textarea
              id="rules"
              name="rules"
              value={values.rules || ''}
              onChange={handleChange}
              disabled={isViewOnly || isLoading}
              className={inputClass}
              rows={3}
              placeholder="Enter game rules"
            />
          </div>

          {!isViewOnly && (
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 cursor-pointer rounded-xl border border-[#2E1C0E] px-4 py-2.5 text-sm font-medium text-[#B08A6C] transition-colors duration-300 hover:bg-white/5 hover:text-[#F2E8DC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading
                  ? type === 'create'
                    ? 'Creating...'
                    : 'Updating...'
                  : type === 'create'
                    ? 'Create Game'
                    : 'Save Changes'}
              </button>
            </div>
          )}

          {isViewOnly && (
            <button
              type="button"
              onClick={handleClose}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98]"
            >
              Close
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
