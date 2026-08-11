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
  category: string
  endType: 'manual' | 'automatic'
  endDate: string
}

const inputClass =
  'w-full rounded-xl border border-[#2E1C0E] bg-[#1B0F08] px-3.5 py-2.5 text-sm text-[#F2E8DC] placeholder-[#8A6A50] outline-none transition-colors duration-300 focus:border-[#C78C3A] focus:ring-2 focus:ring-[#C78C3A]/20'
const labelClass = 'mb-1.5 block text-sm font-medium text-[#B08A6C]'

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
      category: 'Accessories',
      endType: 'manual',
      endDate: '',
    },
    async (data) => {
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('prize', data.prize)
      formData.append('totalSeats', data.totalSeats)
      formData.append('numberOfWinners', data.numberOfWinners)
      formData.append('category', data.category)
      formData.append('endType', data.endType)
      if (data.description) formData.append('description', data.description)
      if (data.rules) formData.append('rules', data.rules)
      if (data.endType === 'automatic' && data.endDate) {
        formData.append('endDate', new Date(data.endDate).toISOString())
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
          className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-[#B08A6C] transition-colors duration-300 hover:text-[#D0AE95]"
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
          className="space-y-8 rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-6 shadow-xl shadow-black/20"
        >
          {/* Basic Info */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#B08A6C]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C78C3A]" />
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
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[#2E1C0E] bg-[#1B0F08] px-3.5 py-3 text-sm text-[#B08A6C] transition-colors duration-300 hover:border-[#C78C3A] hover:text-[#D0AE95]"
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
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#B08A6C]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D0AE95]" />
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
                <label htmlFor="category" className={labelClass}>
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={values.category}
                  onChange={handleChange}
                  className={`${inputClass} cursor-pointer`}
                >
                  <option value="Knives">Knives</option>
                  <option value="Optics">Optics</option>
                  <option value="Ammo">Ammo</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Firearms">Firearms</option>
                </select>
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
              className="flex-1 cursor-pointer rounded-xl border border-[#2E1C0E] px-4 py-2.5 text-center text-sm font-medium text-[#B08A6C] transition-colors duration-300 hover:bg-white/5 hover:text-[#F2E8DC]"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#B4522C] to-[#B4522C] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                {isLoading ? 'Creating...' : 'Create Game'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
