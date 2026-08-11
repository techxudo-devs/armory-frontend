'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, ImageIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useForm } from '@/hooks/useForm'
import { useCreateGameMutation } from '@/lib/api/gamesApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import { publishGameCreated } from '@/lib/realtime/gameCreatedEvents'

interface GameForm {
  title: string
  prize: string
  description: string
  rules: string
  totalSeats: string
  numberOfWinners: string
  endType: 'manual' | 'automatic'
  endDate: string
}

const inputClass =
  'w-full rounded-xl border border-[#23272D] bg-[#14171B] px-3.5 py-2.5 text-sm text-[#F2F3F5] placeholder-[#5C636D] outline-none transition-colors focus:border-[#E53535] focus:ring-2 focus:ring-[#E53535]/20'
const labelClass = 'mb-1.5 block text-sm font-medium text-[#9AA0AA]'

export default function CreateGamePage() {
  const router = useRouter()
  const resetRef = useRef<() => void>(() => {})
  const [prizeImage, setPrizeImage] = useState<File | null>(null)
  const [createGame, { isLoading }] = useCreateGameMutation()

  const { values, handleChange, handleSubmit, reset } = useForm<GameForm>(
    {
      title: '',
      prize: '',
      description: '',
      rules: '',
      totalSeats: '100',
      numberOfWinners: '1',
      endType: 'manual',
      endDate: '',
    },
    async (data) => {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('prize', data.prize)
      formData.append('totalSeats', data.totalSeats)
      formData.append('numberOfWinners', data.numberOfWinners)
      formData.append('endType', data.endType)
      if (data.description) formData.append('description', data.description)
      if (data.rules) formData.append('rules', data.rules)
      if (data.endType === 'automatic' && data.endDate) {
        formData.append('endDate', data.endDate)
      }
      if (prizeImage) formData.append('prizeImage', prizeImage)

      try {
        const created = await createGame(formData).unwrap()
        publishGameCreated({
          gameId: created._id,
          gameCode: created.gameCode,
          title: created.title,
          prize: created.prize,
          createdAt: created.createdAt,
        })
        toast.success('Game created successfully!')
        setPrizeImage(null)
        resetRef.current()
        router.push('/admin/manage-games')
      } catch (error) {
        toast.error(getErrorMessage(error))
      }
    }
  )
  useEffect(() => {
    resetRef.current = reset
  }, [reset])

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <Link
          href="/admin/manage-games"
          prefetch={false}
          className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-[#9AA0AA] transition-colors hover:text-[#E68078]"
        >
          <ArrowLeft size={18} />
          Back to Games
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create New Game</h1>
        <p className="text-muted-foreground">Set up a new game for your platform.</p>
      </div>

      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-6 shadow-xl shadow-black/20"
        >
          {/* Basic Info */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9AA0AA]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E53535]" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Game Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter game title"
                  required
                />
              </div>
              <div>
                <label htmlFor="prize" className={labelClass}>
                  Prize / Gift Name *
                </label>
                <input
                  id="prize"
                  type="text"
                  name="prize"
                  value={values.prize}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. iPhone 16 Pro Max"
                  required
                />
              </div>
              <div>
                <label htmlFor="prizeImage" className={labelClass}>
                  Prize Image
                </label>
                <label
                  htmlFor="prizeImage"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#23272D] bg-[#14171B] px-3.5 py-3 text-sm text-[#9AA0AA] transition-colors hover:border-[#E53535] hover:text-[#E68078]"
                >
                  <ImageIcon size={18} className="shrink-0" />
                  <span className="truncate">
                    {prizeImage ? prizeImage.name : 'Upload prize image (JPEG/PNG, max 5MB)'}
                  </span>
                </label>
                <input
                  id="prizeImage"
                  name="prizeImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPrizeImage(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={values.description}
                  onChange={handleChange}
                  className={inputClass}
                  rows={4}
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
                  value={values.rules}
                  onChange={handleChange}
                  className={inputClass}
                  rows={4}
                  placeholder="Enter game rules"
                />
              </div>
            </div>
          </div>

          {/* Game Settings */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#9AA0AA]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E68078]" />
              Game Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label htmlFor="totalSeats" className={labelClass}>
                  Total Seats *
                </label>
                <input
                  id="totalSeats"
                  type="number"
                  name="totalSeats"
                  value={values.totalSeats}
                  onChange={handleChange}
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
                  value={values.numberOfWinners}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. 1"
                  min={1}
                  max={Math.max(1, Number(values.totalSeats) || 1)}
                  required
                />
              </div>
              <div>
                <label htmlFor="endType" className={labelClass}>
                  End Type *
                </label>
                <select
                  id="endType"
                  name="endType"
                  value={values.endType}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="manual">Manual End</option>
                  <option value="automatic">Automatic End</option>
                </select>
              </div>
            </div>

            {values.endType === 'automatic' && (
              <div className="mt-4 max-w-md">
                <label htmlFor="endDate" className={labelClass}>
                  End Date &amp; Time *
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  name="endDate"
                  value={values.endDate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/admin/manage-games"
              prefetch={false}
              className="flex-1 cursor-pointer rounded-xl border border-[#23272D] px-4 py-2.5 text-center text-sm font-medium text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#E53535] to-[#E68078] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E53535]/25 transition-all hover:from-[#C62E2E] hover:to-[#C94F47] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              {isLoading ? 'Creating...' : 'Create Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
