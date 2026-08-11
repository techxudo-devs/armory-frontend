'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Ban, CheckCircle, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  type User,
} from '@/lib/api/gamesApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import { Pagination } from '@/components/Pagination'

export default function ManageUsersPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data, isLoading, isError, isFetching } = useGetAdminUsersQuery({
    page,
    search: debouncedSearch || undefined,
  })

  const [updateUserStatus, { isLoading: isToggling }] = useUpdateUserStatusMutation()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const users = data?.items || []
  const pagination = data?.pagination

  const filteredUsers = useMemo(() => {
    const items = data?.items || []
    if (statusFilter === 'all') return items
    return items.filter((u) =>
      statusFilter === 'blocked' ? u.isBlocked : !u.isBlocked
    )
  }, [data, statusFilter])

  const handleToggleBlock = async (user: User) => {
    setTogglingId(user._id)
    try {
      await updateUserStatus({ id: user._id, isBlocked: !user.isBlocked }).unwrap()
      toast.success(
        user.isBlocked
          ? `${user.fullName} has been unblocked.`
          : `${user.fullName} has been blocked.`
      )
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts on your platform.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C09A76]" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#3D2715] bg-[#24140B] py-2.5 pl-11 pr-4 text-sm text-[#F4EADD] placeholder-[#9A7A5C] outline-none transition-colors duration-300 focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cursor-pointer rounded-xl border border-[#3D2715] bg-[#24140B] px-4 py-2.5 text-sm text-[#F4EADD] outline-none transition-colors duration-300 focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#3D2715] bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[180px]">Name</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[300px]">Email</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[160px]">Phone</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[130px]">Role</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[150px]">Status</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[120px]">Joined</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#C09A76] max-lg:min-w-[140px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-[#D29A45]" />
                      <p className="text-sm text-[#C09A76]">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-16 text-center">
                      <p className="text-sm text-[#C09A76]">Failed to load users.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-[#3D2715]/60 transition-colors duration-300 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-4 text-sm font-medium text-[#F4EADD]">{user.fullName}</td>
                    <td className="px-5 py-4 text-sm text-[#C09A76]">{user.email}</td>
                    <td className="px-5 py-4 text-sm text-[#C09A76]">{user.phone}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-[#E3C49A]">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          user.isBlocked
                            ? 'bg-orange-600/10 text-amber-500'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#C09A76]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleToggleBlock(user)}
                          disabled={isToggling && togglingId === user._id}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                            user.isBlocked
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-orange-600/10 text-amber-500 hover:bg-orange-600/20'
                          }`}
                        >
                          {isToggling && togglingId === user._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : user.isBlocked ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Ban size={14} />
                          )}
                          {user.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && filteredUsers.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#C09A76]">No users found. Try adjusting your filters.</p>
          </div>
        )}

        {pagination && (
          <Pagination
            page={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalDocs={pagination.totalDocs}
            pageSize={10}
            isFetching={isFetching}
            onPageChange={setPage}
            label="users"
          />
        )}
      </div>

      {/* Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Users" value={pagination?.totalDocs ?? users.length} />
        <SummaryCard
          label="Active Users"
          value={users.filter((u) => !u.isBlocked).length}
        />
        <SummaryCard
          label="Blocked Users"
          value={users.filter((u) => u.isBlocked).length}
        />
      </div>
    </div>
  )
}

interface SummaryCardProps {
  label: string
  value: string | number
}

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#3D2715] bg-gradient-to-b from-[#331E10] to-[#24140B] p-5 shadow-xl shadow-black/20">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
        <Users size={18} className="text-[#E3C49A]" />
      </div>
      <div>
        <p className="text-xs font-medium text-[#C09A76]">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-[#F4EADD]">{value}</p>
      </div>
    </div>
  )
}
