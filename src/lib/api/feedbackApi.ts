import { baseApi, withPagination, type Paginated } from './baseApi'
import type { FeedbackCounts, FeedbackItem, FeedbackStatus } from './types'

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitFeedback: builder.mutation<
      FeedbackItem,
      { type: string; subject: string; message: string }
    >({
      query: (body) => ({
        url: '/feedback',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Feedback'],
    }),

    getMyFeedback: builder.query<Paginated<FeedbackItem>, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 10 }) => ({
        url: '/feedback/my',
        params: { page, limit },
      }),
      transformResponse: (data: FeedbackItem[], meta) => withPagination(data, meta),
      providesTags: ['Feedback'],
    }),

    getFeedback: builder.query<
      Paginated<FeedbackItem>,
      { page?: number; limit?: number; status?: FeedbackStatus }
    >({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/feedback',
        params: { page, limit, status },
      }),
      transformResponse: (data: FeedbackItem[], meta) => withPagination(data, meta),
      providesTags: ['Feedback'],
    }),

    getFeedbackCounts: builder.query<FeedbackCounts, void>({
      query: () => ({ url: '/feedback/counts' }),
      providesTags: ['Feedback'],
    }),

    updateFeedbackStatus: builder.mutation<
      FeedbackItem,
      { id: string; status: FeedbackStatus }
    >({
      query: ({ id, status }) => ({
        url: `/feedback/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Feedback'],
    }),

    deleteFeedback: builder.mutation<void, string>({
      query: (id) => ({
        url: `/feedback/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Feedback'],
    }),
  }),
})

export const {
  useSubmitFeedbackMutation,
  useGetMyFeedbackQuery,
  useGetFeedbackQuery,
  useGetFeedbackCountsQuery,
  useUpdateFeedbackStatusMutation,
  useDeleteFeedbackMutation,
} = feedbackApi
