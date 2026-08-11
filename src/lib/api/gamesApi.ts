import { baseApi, withPagination, type Paginated } from './baseApi'
import type {
  AdminAnalytics,
  AdminHistoryEntry,
  Game,
  GameDetailsResult,
  Participant,
  PendingApproval,
  User,
} from './types'

export type { Game, GameHistory, User, AdminHistoryEntry } from './types'

export const gamesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public games
    getPublicGames: builder.query<Paginated<Game>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/games',
        params: { page, limit },
      }),
      transformResponse: (data: Game[], meta) => withPagination(data, meta),
      providesTags: ['Game'],
    }),
    getGameByCode: builder.query<GameDetailsResult, string>({
      query: (gameCode) => ({ url: `/games/code/${gameCode}` }),
      providesTags: ['Game'],
    }),

    // Admin games
    getAdminGames: builder.query<Paginated<Game>, { page?: number; limit?: number; status?: string }>({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/admin/games',
        params: { page, limit, status },
      }),
      transformResponse: (data: Game[], meta) => withPagination(data, meta),
      providesTags: ['Game'],
    }),
    createGame: builder.mutation<Game, FormData>({
      query: (formData) => ({
        url: '/admin/games',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Game', 'Analytics'],
    }),
    updateGame: builder.mutation<Game, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/admin/games/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Game'],
    }),
    deleteGame: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/games/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Game', 'Analytics', 'History'],
    }),
    endGame: builder.mutation<Game, string>({
      query: (id) => ({
        url: `/admin/games/${id}/end`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Game', 'Analytics'],
    }),
    announceWinners: builder.mutation<Game, { id: string; winnerSeatNumbers: number[] }>({
      query: ({ id, winnerSeatNumbers }) => ({
        url: `/admin/games/${id}/announce-winners`,
        method: 'POST',
        body: { winnerSeatNumbers },
      }),
      invalidatesTags: ['Game', 'Analytics', 'History'],
    }),
    getGameParticipants: builder.query<Paginated<Participant>, { id: string; page?: number; limit?: number }>({
      query: ({ id, page = 1, limit = 50 }) => ({
        url: `/admin/games/${id}/participants`,
        params: { page, limit },
      }),
      transformResponse: (data: Participant[], meta) => withPagination(data, meta),
      providesTags: ['Game'],
    }),

    // Admin analytics & history
    getAdminAnalytics: builder.query<AdminAnalytics, void>({
      query: () => ({ url: '/admin/analytics' }),
      providesTags: ['Analytics'],
    }),
    getAdminGameHistory: builder.query<Paginated<AdminHistoryEntry>, { page?: number; limit?: number; status?: string }>({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/admin/history',
        params: { page, limit, status },
      }),
      transformResponse: (data: AdminHistoryEntry[], meta) => withPagination(data, meta),
      providesTags: ['History'],
    }),
    deleteAdminHistoryEntry: builder.mutation<void, string>({
      query: (seatId) => ({
        url: `/admin/history/${seatId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['History', 'Game'],
    }),

    // Admin users
    getAdminUsers: builder.query<Paginated<User>, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 10, search }) => ({
        url: '/users',
        params: { page, limit, search },
      }),
      transformResponse: (data: User[], meta) => withPagination(data, meta),
      providesTags: ['User'],
    }),
    updateUserStatus: builder.mutation<User, { id: string; isBlocked: boolean }>({
      query: ({ id, isBlocked }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { isBlocked },
      }),
      invalidatesTags: ['User'],
    }),

    // Admin pending seat approvals
    getPendingApprovals: builder.query<PendingApproval[], void>({
      query: () => ({ url: '/admin/pending-approvals' }),
      providesTags: ['PendingApprovals'],
    }),
    approvePendingSeats: builder.mutation<{ approved: number }, string[]>({
      query: (seatIds) => ({
        url: '/admin/pending-approvals/approve',
        method: 'POST',
        body: { seatIds },
      }),
      invalidatesTags: ['PendingApprovals', 'Game', 'JoinedGames', 'Analytics'],
    }),
    rejectPendingSeats: builder.mutation<{ rejected: number }, string[]>({
      query: (seatIds) => ({
        url: '/admin/pending-approvals/reject',
        method: 'POST',
        body: { seatIds },
      }),
      invalidatesTags: ['PendingApprovals', 'Game', 'JoinedGames'],
    }),
  }),
})

export const {
  useGetPublicGamesQuery,
  useGetGameByCodeQuery,
  useGetAdminGamesQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useEndGameMutation,
  useAnnounceWinnersMutation,
  useGetGameParticipantsQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminGameHistoryQuery,
  useDeleteAdminHistoryEntryMutation,
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useGetPendingApprovalsQuery,
  useApprovePendingSeatsMutation,
  useRejectPendingSeatsMutation,
} = gamesApi
