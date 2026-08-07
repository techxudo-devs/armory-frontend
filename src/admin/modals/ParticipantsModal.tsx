'use client'

import { useState } from 'react'
import { X, Trophy, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Game, Participant } from '@/lib/api/types'
import {
  useGetGameParticipantsQuery,
  useAnnounceWinnersMutation,
} from '@/lib/api/gamesApi'
import { getErrorMessage } from '@/lib/api/baseApi'
import { Pagination } from '@/components/Pagination'

interface ParticipantsModalProps {
  isOpen: boolean
  game: Game | null
  onClose: () => void
  allowWinnerSelection?: boolean
}

export function ParticipantsModal({
  isOpen,
  game,
  onClose,
  allowWinnerSelection = false,
}: ParticipantsModalProps) {
  if (!isOpen || !game) return null
  return (
    <ParticipantsContent
      key={game._id}
      game={game}
      onClose={onClose}
      allowWinnerSelection={allowWinnerSelection}
    />
  )
}

function ParticipantsContent({
  game,
  onClose,
  allowWinnerSelection,
}: {
  game: Game
  onClose: () => void
  allowWinnerSelection: boolean
}) {
  const { data, isLoading } = useGetGameParticipantsQuery(
    { id: game._id, page: 1, limit: 100 }
  )
  const [announceWinners, { isLoading: announcing }] = useAnnounceWinnersMutation()
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [participantPage, setParticipantPage] = useState(1)

  const participants: Participant[] = data?.items || []
  const canSelect = allowWinnerSelection && game.status === 'ended'
  const maxWinners = game.numberOfWinners || 1
  const pageSize = 10
  const participantTotalPages = Math.max(1, Math.ceil(participants.length / pageSize))
  const pagedParticipants = participants.slice(
    (participantPage - 1) * pageSize,
    participantPage * pageSize,
  )

  const toggleSeat = (seatNumber: number) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber)
      }
      if (prev.length >= maxWinners) {
        toast.error(`You can only select up to ${maxWinners} winner(s).`)
        return prev
      }
      return [...prev, seatNumber]
    })
  }

  const handleAnnounce = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one winning seat.')
      return
    }
    try {
      await announceWinners({
        id: game._id,
        winnerSeatNumbers: selectedSeats.sort((a, b) => a - b),
      }).unwrap()
      toast.success('Winners announced and notifications dispatched!')
      onClose()
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[80vh] w-full max-w-xl flex-col rounded-2xl border border-[#1F293D] bg-[#14171B] p-5 text-[#F2F3F5] shadow-2xl shadow-black/60">
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-wide">Participants</h2>
            <p className="mt-0.5 text-xs text-[#8B93A7]">{game.title}</p>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-[#8B93A7] transition-colors hover:bg-white/5 hover:text-[#F2F3F5]"
          >
            <X size={18} />
          </button>
        </div>

        {canSelect && (
          <div className="mb-4 shrink-0 flex items-center gap-2 rounded-xl border border-[#FB923C]/30 bg-[#FB923C]/10 px-4 py-3 text-xs text-[#FB923C]">
            <Trophy size={16} className="shrink-0" />
            <span>
              Select up to <strong>{maxWinners}</strong> winning seat(s) to announce.
              Selected: {selectedSeats.length}/{maxWinners}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#6667DD]" />
              <p className="text-sm text-[#8B93A7]">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-[#5C636D]" />
              <p className="text-sm text-[#8B93A7]">No seats reserved yet for this game.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {pagedParticipants.map((p) => {
                const userName =
                  typeof p.userId === 'string' ? p.userId : p.userId?.fullName || 'Unknown'
                const userPhone =
                  typeof p.userId === 'string' ? '' : p.userId?.phone || ''
                const isSelected = selectedSeats.includes(p.seatNumber)
                return (
                  <li
                    key={p._id}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      isSelected
                        ? 'border-[#34D399]/50 bg-[#34D399]/10'
                        : 'border-[#23272D] bg-[#0F1422]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6667DD]/15 font-plus text-sm font-bold text-[#A5B4FC]">
                        #{p.seatNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#F2F3F5]">{userName}</p>
                        <p className="truncate text-xs text-[#8B93A7]">{userPhone}</p>
                      </div>
                    </div>
                    {canSelect && (
                      <button
                        type="button"
                        onClick={() => toggleSeat(p.seatNumber)}
                        className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? 'border-[#34D399] bg-[#34D399] text-[#0F1422]'
                            : 'border-[#5C636D] bg-transparent'
                        }`}
                        aria-label={`Toggle seat ${p.seatNumber}`}
                      >
                        {isSelected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6.5L5 9L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {participants.length > 0 && (
          <div className="shrink-0">
            <Pagination
              page={participantPage}
              totalPages={participantTotalPages}
              totalDocs={participants.length}
              pageSize={pageSize}
              onPageChange={(p) => setParticipantPage(Math.min(participantTotalPages, p))}
              label="participants"
            />
          </div>
        )}

        <div className="mt-4 flex shrink-0 gap-3 border-t border-[#1F293D] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-[#23272D] px-4 py-2.5 text-sm font-medium text-[#9AA0AA] transition-colors hover:bg-white/5 hover:text-[#F2F3F5]"
          >
            Close
          </button>
          {canSelect && (
            <button
              type="button"
              onClick={handleAnnounce}
              disabled={announcing || selectedSeats.length === 0}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#34D399] to-[#10B981] px-4 py-2.5 text-sm font-semibold text-[#06281C] shadow-lg shadow-[#34D399]/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {announcing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy size={16} />}
              {announcing ? "Announcing..." : "Announce Winners"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
