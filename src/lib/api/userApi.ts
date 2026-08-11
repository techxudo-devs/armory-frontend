import { baseApi, withPagination, type Paginated } from './baseApi'
import type { AuthUser, JoinedGame, NotificationItem, NotificationsResult } from './types'

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyJoinedGames: builder.query<
      Paginated<JoinedGame>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/seats/my-games',
        params: { page, limit },
      }),
      transformResponse: withPagination<JoinedGame>,
      providesTags: ['JoinedGames'],
    }),

    reserveSeats: builder.mutation<
      { seatNumbers: number[]; status: 'pending' },
      {
        gameId: string
        seatNumbers: number[]
        paymentReference: string
        paymentProof?: File
      }
    >({
      query: ({ gameId, seatNumbers, paymentReference, paymentProof }) => {
        const formData = new FormData()
        formData.append('seatNumbers', JSON.stringify(seatNumbers))
        formData.append('paymentReference', paymentReference)
        if (paymentProof) formData.append('paymentProof', paymentProof)
        return {
          url: `/seats/${gameId}/reserve`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: ['JoinedGames', 'Game'],
    }),

    getNotifications: builder.query<
      NotificationsResult,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 50 }) => ({
        url: '/notifications',
        params: { page, limit },
      }),
      providesTags: ['Notifications'],
    }),

    markNotificationRead: builder.mutation<NotificationItem, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notifications'],
    }),

    deleteAllReadNotifications: builder.mutation<
      { deletedCount: number },
      void
    >({
      query: () => ({ url: '/notifications/read-all', method: 'DELETE' }),
      invalidatesTags: ['Notifications'],
    }),

    updateAvatar: builder.mutation<AuthUser, FormData>({
      query: (formData) => ({
        url: '/users/avatar',
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useGetMyJoinedGamesQuery,
  useReserveSeatsMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllReadNotificationsMutation,
  useUpdateAvatarMutation,
} = userApi
