'use client'

import { useRef, useState } from 'react'
import { Save, Lock, Camera, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useGetMeQuery } from '@/lib/api/authApi'
import { useUpdateAvatarMutation } from '@/lib/api/userApi'

const inputClass =
  'w-full rounded-xl border border-[#3D2715] bg-[#24140B] px-3.5 py-2.5 text-sm text-[#F4EADD] placeholder-[#9A7A5C] outline-none transition-colors duration-300 focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20 disabled:cursor-not-allowed disabled:opacity-50'
const labelClass = 'mb-1.5 block text-sm font-medium text-[#C09A76]'
const primaryBtn =
  'flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-4 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98]'
const outlineBtn =
  'flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#3D2715] px-4 py-2.5 text-sm font-medium text-[#C09A76] transition-colors duration-300 hover:bg-white/5 hover:text-[#F4EADD]'

export default function MyProfilePage() {
  const { data: user } = useGetMeQuery()
  const [updateAvatar, { isLoading: isUploading }] = useUpdateAvatarMutation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' })
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)

  if (user && loadedUserId !== user._id) {
    setLoadedUserId(user._id)
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    try {
      await updateAvatar(formData).unwrap()
      toast.success('Profile picture updated!')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.info('Profile updates will be available soon')
    setIsEditing(false)
  }

  const initials = (user?.fullName ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 text-center shadow-xl shadow-black/20">
          <div className="relative">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#D29A45] to-[#E3C49A] text-[#1a1408] shadow-lg shadow-[#D29A45]/25">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.fullName}
                  width={112}
                  height={112}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#3D2715] bg-[#24140B] text-[#E3C49A] transition-colors duration-300 hover:bg-[#D29A45] hover:text-[#1a1408] disabled:cursor-not-allowed disabled:opacity-50"
              title="Change Avatar"
            >
              {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="mt-5 min-w-0">
            <h2 className="text-2xl font-bold text-[#F4EADD]">
              {user?.fullName ?? 'Loading...'}
            </h2>
            <p className="mt-1 text-sm text-[#C09A76]">{user?.email ?? ''}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#D29A45]/10 px-3 py-1 text-xs font-semibold text-[#E3C49A]">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              Player
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSave}
          className="space-y-6 rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20 lg:col-span-2"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-[#F4EADD]">Personal Information</h3>
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing)
                if (isEditing && user) {
                  setForm({ fullName: user.fullName, email: user.email, phone: user.phone })
                }
              }}
              className={isEditing ? outlineBtn : primaryBtn}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={inputClass}
                placeholder="Your phone number"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={inputClass}
              placeholder="Your email address"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 border-t border-[#3D2715]/60 pt-5">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  if (user) {
                    setForm({ fullName: user.fullName, email: user.email, phone: user.phone })
                  }
                }}
                className={`${outlineBtn} flex-1`}
              >
                Cancel
              </button>
              <button type="submit" className={`${primaryBtn} flex-1`}>
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </form>

        {/* Security Section */}
        <div className="rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-6 shadow-xl shadow-black/20 lg:col-span-3">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <Lock size={18} className="text-[#E3C49A]" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#F4EADD]">Password &amp; Security</h3>
                <p className="mt-0.5 text-sm text-[#C09A76]">
                  To change your password we&apos;ll email you a secure reset link.
                </p>
              </div>
            </div>
            <Link
              href="/forgot-password"
              prefetch={false}
              className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D29A45] to-[#E3C49A] px-5 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#D29A45]/25 transition-all duration-300 hover:from-[#B4522C] hover:to-[#B4522C] active:scale-[0.98]"
            >
              <ShieldCheck size={16} />
              Change Password
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
