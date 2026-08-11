"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Eye,
  Trophy,
  Users,
  Loader2,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { ParticipantsModal } from "@/admin/modals/ParticipantsModal";
import {
  useGetAdminGamesQuery,
  type Game,
} from "@/lib/api/gamesApi";
import { Pagination } from "@/components/Pagination";

export default function EndedGamesPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [participantsGame, setParticipantsGame] = useState<Game | null>(null);

  const { data, isLoading, isError, isFetching } = useGetAdminGamesQuery(
    { page, status: "ended" }
  );

  const filteredGames = useMemo(() => {
    const items = data?.items || [];
    const term = searchTerm.toLowerCase();
    if (!term) return items;
    return items.filter(
      (game) =>
        game.title.toLowerCase().includes(term) ||
        game.gameCode.toLowerCase().includes(term),
    );
  }, [data, searchTerm]);

  const pagination = data?.pagination;

  const handleCopyLink = async (game: Game) => {
    const link = `${window.location.origin}/game/${game.gameCode}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Game link copied!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F4EADD]">Ended Games</h1>
          <p className="mt-1 text-sm text-[#C09A76]">
            View participants and announce winners for games that have ended.
          </p>
        </div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#C09A76]"
          />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or code..."
            className="w-full rounded-xl border border-[#3D2715] bg-[#24140B] py-2.5 pl-11 pr-4 text-sm text-[#F4EADD] placeholder-[#9A7A5C] outline-none transition-colors duration-300 focus:border-[#D29A45] focus:ring-2 focus:ring-[#D29A45]/20 sm:w-72"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#3D2715] bg-[#24140B] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-[#3D2715] bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-[#C09A76]">
                <th className="px-5 py-4 max-lg:min-w-[200px]">Game</th>
                <th className="px-5 py-4 max-lg:min-w-[200px]">Prize</th>
                <th className="px-5 py-4 max-lg:min-w-[170px]">Seats Filled</th>
                <th className="px-5 py-4 max-lg:min-w-[140px]">Winners</th>
                <th className="px-5 py-4 max-lg:min-w-[120px]">Created</th>
                <th className="px-5 py-4 text-right max-lg:min-w-[200px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-[#D29A45]" />
                      <p className="text-sm text-[#C09A76]">Loading ended games...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 text-center">
                      <p className="text-sm text-[#C09A76]">Failed to load ended games.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => (
                  <tr
                    key={game._id}
                    className="border-b border-[#3D2715]/60 transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#F4EADD]">{game.title}</p>
                      <p className="mt-0.5 font-plus text-xs text-[#9A7A5C]">{game.gameCode}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#F4EADD]">
                      {game.prize}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#C09A76]">
                      <span className="font-semibold text-[#F4EADD]">
                        {game.reservedSeatsCount}
                      </span>
                      <span className="mx-1 text-[#9A7A5C]">/</span>
                      {game.totalSeats}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#C09A76]">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400">
                        <Trophy size={12} />
                        {game.winners?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#C09A76]">
                      {new Date(game.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleCopyLink(game)}
                          className="cursor-pointer rounded-lg p-2 text-[#C09A76] transition-colors duration-300 hover:bg-[#D29A45]/15 hover:text-[#E3C49A]"
                          title="Copy Game Link"
                        >
                          <Link2 size={18} />
                        </button>
                        <button
                          onClick={() => setParticipantsGame(game)}
                          className="cursor-pointer rounded-lg p-2 text-[#C09A76] transition-colors duration-300 hover:bg-[#D29A45]/15 hover:text-[#E3C49A]"
                          title="View Participants & Announce Winners"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && filteredGames.length === 0 && (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-[#9A7A5C]" />
            <p className="font-semibold text-[#F4EADD]">No ended games found</p>
            <p className="mt-1 text-sm text-[#C09A76]">
              Ended games will appear here and are ready for winners to be announced.
            </p>
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
            label="ended games"
          />
        )}
      </div>

      <ParticipantsModal
        isOpen={!!participantsGame}
        game={participantsGame}
        onClose={() => setParticipantsGame(null)}
        allowWinnerSelection
      />
    </div>
  );
}
