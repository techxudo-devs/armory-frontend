'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useGetMeQuery } from '@/lib/api/authApi'
import { HeaderDash } from './HeaderDash'
import { MobileSidebar, SidebarDash } from './SidebarDash'

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user, isLoading, isError } = useGetMeQuery()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (isError) {
      router.replace('/login')
    }
  }, [isError, router])

  useEffect(() => {
    if (!isLoading && user && pathname.startsWith('/admin') && user.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [isLoading, user, pathname, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B101D]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#E53535] border-t-transparent" />
          <p className="text-sm text-[#9AA0AA]">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  const sessionUser = {
    name: user.fullName,
    email: user.email,
    role: user.role as 'admin' | 'user',
  }

  return (
    <div className="flex min-h-screen bg-[#0B101D] text-white selection:bg-[#E53535] selection:text-white">
      <SidebarDash user={sessionUser} />
      <div className="w-full md:w-[90%] lg:w-4/5 flex flex-col min-w-0 min-h-screen">
        <HeaderDash
          user={sessionUser}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="p-6 flex-1 bg-[#0B101D]">{children}</main>
      </div>
      <MobileSidebar
        user={sessionUser}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </div>
  )
}
