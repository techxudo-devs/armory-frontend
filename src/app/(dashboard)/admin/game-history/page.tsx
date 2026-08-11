'use client'

import { useState, useMemo } from 'react'
import { Search, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetAdminGameHistoryQuery,
  useDeleteAdminHistoryEntryMutation,
  type AdminHistoryEntry,
} from '@/lib/api/gamesApi'
import { DeleteModal } from '@/admin/modals/DeleteModal'
import { Pagination } from '@/components/Pagination'

const resultOf = (entry: AdminHistoryEntry): string => {
  if (entry.gameStatus === 'completed') return entry.isWinner ? 'won' : 'lost'
  return entry.gameStatus
}

const statusStyles: Record<string, string> = {
  won: 'bg-emerald-500/10 text-emerald-400',
  lost: 'bg-orange-600/10 text-amber-500',
  ended: 'bg-amber-500/10 text-amber-400',
  active: 'bg-[#C78C3A]/10 text-[#D0AE95]',
}

export default function GameHistoryPage() {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [entryToDelete, setEntryToDelete] = useState<AdminHistoryEntry | null>(
    null,
  )

  const { data, isLoading, isError, isFetching } = useGetAdminGameHistoryQuery({
    page,
  })
  const [deleteEntry, { isLoading: isDeleting }] =
    useDeleteAdminHistoryEntryMutation()

  const pagination = data?.pagination

  const filteredHistory = useMemo(() => {
    const items = data?.items || []
    const term = searchTerm.toLowerCase()
    if (!term) return items
    return items.filter(
      (entry) =>
        entry.gameTitle.toLowerCase().includes(term) ||
        entry.userName.toLowerCase().includes(term) ||
        entry.gameCode.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  const totalWinners = filteredHistory.length

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return
    try {
      await deleteEntry(entryToDelete._id).unwrap()
      toast.success('History entry deleted')
      setEntryToDelete(null)
    } catch {
      toast.error('Failed to delete history entry')
    }
  }

  return (
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Game History</h1>
        <p className="text-muted-foreground">View all winning players and their prizes on your platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StatItem label="Total Winners" value={totalWinners} accent="text-emerald-400" />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B08A6C]" size={18} />
          <input
            type="text"
            placeholder="Search by game, winner or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#2E1C0E] bg-[#1B0F08] py-2.5 pl-11 pr-4 text-sm text-[#F2E8DC] placeholder-[#8A6A50] outline-none transition-colors duration-300 focus:border-[#C78C3A] focus:ring-2 focus:ring-[#C78C3A]/20"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2E1C0E] bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[240px]">Game Name</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[180px]">Player</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[120px]">Seat</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[140px]">Result</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[200px]">Prize Won</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[150px]">Date</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-[#C78C3A]" />
                      <p className="text-sm text-[#B08A6C]">Loading history...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-16 text-center">
                      <p className="text-sm text-[#B08A6C]">Failed to load game history.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry) => {
                  const result = resultOf(entry)
                  return (
                    <tr key={entry._id} className="border-b border-[#2E1C0E]/60 transition-colors duration-300 last:border-0 hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#F2E8DC]">{entry.gameTitle}</p>
                        <p className="mt-0.5 font-plus text-xs text-[#8A6A50]">{entry.gameCode}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#F2E8DC]">{entry.userName}</p>
                        <p className="mt-0.5 text-xs text-[#8A6A50]">{entry.userPhone}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#B08A6C]">#{entry.seatNumber}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[result] ?? statusStyles.ended}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {result}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#F2E8DC]">
                        {entry.isWinner ? entry.prize : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#B08A6C]">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setEntryToDelete(entry)}
                          disabled={isDeleting}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#2E1C0E] bg-[#1B0F08] text-[#8A6A50] transition-colors duration-300 hover:border-orange-600/30 hover:bg-orange-600/10 hover:text-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
                          title="Delete history entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && filteredHistory.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm text-[#B08A6C]">No winners found.</p>
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
            label="winners"
          />
        )}
      </div>

      <DeleteModal
        isOpen={entryToDelete !== null}
        title="Delete history entry"
        message={`Delete history for ${entryToDelete?.userName ?? 'this player'} in "${entryToDelete?.gameTitle ?? 'this game'}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}

interface StatItemProps {
  label: string
  value: string | number
  accent?: string
}

function StatItem({ label, value, accent = '' }: StatItemProps) {
  return (
    <div className="rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] p-5 shadow-xl shadow-black/20">
      <p className="mb-1.5 text-xs font-medium text-[#B08A6C]">{label}</p>
      <p className={`text-2xl font-bold ${accent || 'text-[#F2E8DC]'}`}>{value}</p>
    </div>
  )
}
