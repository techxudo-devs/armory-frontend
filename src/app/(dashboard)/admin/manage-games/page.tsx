"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  CircleStop,
  Loader2,
  Link2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { GameModal } from "@/admin/modals/GameModal";
import { DeleteModal } from "@/admin/modals/DeleteModal";
import { ParticipantsModal } from "@/admin/modals/ParticipantsModal";
import {
  useGetAdminGamesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useEndGameMutation,
  type Game,
} from "@/lib/api/gamesApi";
import { getErrorMessage } from "@/lib/api/baseApi";
import { Pagination } from "@/components/Pagination";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400",
  ended: "bg-amber-500/10 text-amber-400",
  completed: "bg-amber-500/10 text-amber-400",
};

const toFormData = (data: Partial<Game> & { prizeImage?: File | null }) => {
  const formData = new FormData();
  const append = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === "") return;
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  };
  append("title", data.title);
  append("prize", data.prize);
  append("description", data.description);
  append("rules", data.rules);
  append("totalSeats", data.totalSeats);
  append("numberOfWinners", data.numberOfWinners);
  append("category", data.category);
  append("endType", data.endType);
  if (data.endType === "automatic" && data.endDate)
    append("endDate", new Date(data.endDate).toISOString());
  append("prizeImage", data.prizeImage);
  return formData;
};

export default function ManageGamesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const gameModal = useModal();
  const deleteModal = useModal();
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [participantsGame, setParticipantsGame] = useState<Game | null>(null);

  const { data, isLoading, isError, isFetching } = useGetAdminGamesQuery({
    page,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const [createGame, { isLoading: isCreating }] = useCreateGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  const [deleteGame, { isLoading: isDeleting }] = useDeleteGameMutation();
  const [endGame, { isLoading: isEnding }] = useEndGameMutation();

  const games = data?.items || [];
  const pagination = data?.pagination;

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

  const handleGameSubmit = async (
    data: Partial<Game> & { prizeImage?: File | null },
  ) => {
    try {
      if (gameModal.modalType === "create") {
        await createGame(toFormData(data)).unwrap();
        toast.success("Game created successfully!");
        gameModal.close();
      } else if (gameModal.modalType === "edit" && gameModal.selectedId) {
        await updateGame({
          id: gameModal.selectedId,
          formData: toFormData(data),
        }).unwrap();
        toast.success("Game updated successfully!");
        gameModal.close();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!gameToDelete) return;
    try {
      await deleteGame(gameToDelete).unwrap();
      toast.success("Game deleted successfully!");
      deleteModal.close();
      setGameToDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const openDeleteModal = (id: string) => {
    setGameToDelete(id);
    deleteModal.open("delete");
  };

  const handleEndGame = async (game: Game) => {
    try {
      await endGame(game._id).unwrap();
      toast.success(`Game "${game.title}" ended. You can now select winners.`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

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
    <div className="min-h-screen bg-background p-0">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Manage Games
            </h1>
            <p className="text-muted-foreground">
              View and manage all games on your platform.
            </p>
          </div>
          <Link
            href="/admin/create-game"
            prefetch={false}
            className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#C78C3A] to-[#D0AE95] px-5 py-2.5 text-sm font-semibold text-[#1a1408] shadow-lg shadow-[#C78C3A]/25 transition-all duration-300 hover:shadow-[#C78C3A]/40 active:scale-[0.98]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#B4522C] to-[#B4522C] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative flex items-center gap-2">
              <Plus size={18} />
              Create Game
            </span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B08A6C]"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by title or game code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#2E1C0E] bg-[#1B0F08] py-2.5 pl-11 pr-4 text-sm text-[#F2E8DC] placeholder-[#8A6A50] outline-none transition-colors duration-300 focus:border-[#C78C3A] focus:ring-2 focus:ring-[#C78C3A]/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="cursor-pointer rounded-xl border border-[#2E1C0E] bg-[#1B0F08] px-4 py-2.5 text-sm text-[#F2E8DC] outline-none transition-colors duration-300 focus:border-[#C78C3A] focus:ring-2 focus:ring-[#C78C3A]/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Games Table */}
      <div className="overflow-hidden rounded-2xl border border-[#2E1C0E] bg-gradient-to-b from-[#241409] to-[#1B0F08] shadow-xl shadow-black/20">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#2E1C0E] bg-white/[0.02]">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[280px]">
                  Game
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[150px]">
                  Status
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[200px]">
                  Prize
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[120px]">
                  Seats
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[120px]">
                  Winners
                </th>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[120px]">
                  Created
                </th>
                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#B08A6C] max-lg:min-w-[290px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7}>
                    <div className="flex flex-col items-center justify-center gap-3 py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-[#C78C3A]" />
                      <p className="text-sm text-[#B08A6C]">Loading games...</p>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7}>
                    <div className="py-16 text-center">
                      <p className="text-sm text-[#B08A6C]">
                        Failed to load games.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGames.map((game) => (
                  <tr
                    key={game._id}
                    className="border-b border-[#2E1C0E]/60 transition-colors duration-300 last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-[#F2E8DC]">
                        {game.title}
                      </p>
                      <p className="mt-0.5 font-plus text-xs text-[#8A6A50]">
                        {game.gameCode}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[game.status] ?? statusStyles.active}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {game.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-[#F2E8DC]">
                      {game.prize}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#B08A6C]">
                      <span className="font-semibold text-[#F2E8DC]">
                        {game.reservedSeatsCount}
                      </span>
                      <span className="mx-1 text-[#8A6A50]">/</span>
                      {game.totalSeats}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#B08A6C]">
                      {game.numberOfWinners}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#B08A6C]">
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
                          className="cursor-pointer rounded-lg p-2 text-[#B08A6C] transition-colors duration-300 hover:bg-[#C78C3A]/15 hover:text-[#D0AE95]"
                          title="Copy Game Link"
                        >
                          <Link2 size={18} />
                        </button>
                        <button
                          onClick={() => setParticipantsGame(game)}
                          className="cursor-pointer rounded-lg p-2 text-[#B08A6C] transition-colors duration-300 hover:bg-[#7E9C6B]/15 hover:text-[#7E9C6B]"
                          title="Participants"
                        >
                          <Users size={18} />
                        </button>
                        <button
                          onClick={() => gameModal.open("view", game._id)}
                          className="cursor-pointer rounded-lg p-2 text-[#B08A6C] transition-colors duration-300 hover:bg-[#C78C3A]/15 hover:text-[#D0AE95]"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => gameModal.open("edit", game._id)}
                          disabled={game.status !== "active"}
                          className="cursor-pointer rounded-lg p-2 text-[#B08A6C] transition-colors duration-300 hover:bg-[#D0AE95]/15 hover:text-[#D0AE95] disabled:cursor-not-allowed disabled:opacity-40"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        {game.status === "active" && (
                          <button
                            onClick={() => handleEndGame(game)}
                            disabled={isEnding}
                            className="flex cursor-pointer items-center gap-1 rounded-lg p-2 text-[#B08A6C] transition-colors duration-300 hover:bg-amber-500/15 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                            title="End Game"
                          >
                            {isEnding ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <CircleStop size={16} />
                            )}
                            {isEnding && <span className="text-xs">Ending</span>}
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(game._id)}
                          className="cursor-pointer rounded-lg p-2 text-[#B08A6C] transition-colors duration-300 hover:bg-orange-600/15 hover:text-amber-500"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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
            <p className="text-sm text-[#B08A6C]">
              No games found. Try adjusting your filters.
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
            label="games"
          />
        )}
      </div>

      {/* Modals */}
      <GameModal
        isOpen={gameModal.isOpen && gameModal.modalType !== "delete"}
        type={gameModal.modalType as "create" | "edit" | "view" | null}
        game={
          gameModal.selectedId
            ? games.find((g) => g._id === gameModal.selectedId)
            : undefined
        }
        onClose={gameModal.close}
        onSubmit={handleGameSubmit}
        isLoading={isCreating || isUpdating}
      />

      <DeleteModal
        isOpen={deleteModal.isOpen && deleteModal.modalType === "delete"}
        title="Delete Game"
        message="Are you sure you want to delete this game? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={deleteModal.close}
        isLoading={isDeleting}
      />

      <ParticipantsModal
        isOpen={!!participantsGame}
        game={participantsGame}
        onClose={() => setParticipantsGame(null)}
      />
    </div>
  );
}
