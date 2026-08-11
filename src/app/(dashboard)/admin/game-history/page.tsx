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
  lost: 'bg-red-500/10 text-red-400',
  ended: 'bg-amber-500/10 text-amber-400',
  active: 'bg-sky-500/10 text-sky-400',
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
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0AA]" size={18} />
          <input
            type="text"
            placeholder="Search by game, winner or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#23272D] bg-[#14171B] py-2.5 pl-11 pr-4 text-sm text-[#F2F3F5] placeholder-[#5C636D] outline-none transition-colors focus:border-[#E53535] focus:ring-2 focus:ring-[#E53535]/20"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#23272D] bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[240px]">Game Name</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[180px]">Player</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[120px]">Seat</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[140px]">Result</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[200px]">Prize Won</th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[150px]">Date</th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#9AA0AA] max-lg:min-w-[130px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-[#E53535]" />
                      <p className="text-sm text-[#9AA0AA]">Loading history...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-16 text-center">
                      <p className="text-sm text-[#9AA0AA]">Failed to load game history.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((entry) => {
                  const result = resultOf(entry)
                  return (
                    <tr key={entry._id} className="border-b border-[#23272D]/60 transition-colors last:border-0 hover:bg-white/[0.03]">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#F2F3F5]">{entry.gameTitle}</p>
                        <p className="mt-0.5 font-plus text-xs text-[#5C636D]">{entry.gameCode}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#F2F3F5]">{entry.userName}</p>
                        <p className="mt-0.5 text-xs text-[#5C636D]">{entry.userPhone}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#9AA0AA]">#{entry.seatNumber}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[result] ?? statusStyles.ended}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {result}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-[#F2F3F5]">
                        {entry.isWinner ? entry.prize : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#9AA0AA]">
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
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#23272D] bg-[#14171B] text-[#5C636D] transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
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
            <p className="text-sm text-[#9AA0AA]">No winners found.</p>
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
    <div className="rounded-2xl border border-[#23272D] bg-gradient-to-b from-[#191D22] to-[#14171B] p-5 shadow-xl shadow-black/20">
      <p className="mb-1.5 text-xs font-medium text-[#9AA0AA]">{label}</p>
      <p className={`text-2xl font-bold ${accent || 'text-[#F2F3F5]'}`}>{value}</p>
    </div>
  )
}
