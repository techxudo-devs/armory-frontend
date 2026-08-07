import { baseApi } from './baseApi'
import type { AuthUser } from './types'

export interface LoginResponse {
  user: AuthUser
  token: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, { identifier: string; password: string }>({
      query: ({ identifier, password }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { identifier, password },
      }),
      invalidatesTags: ['Auth'],
    }),
    register: builder.mutation<
      LoginResponse,
      { fullName: string; email: string; phone: string; password: string }
    >({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<void, { token: string; newPassword: string }>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Auth'],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetMeQuery,
} = authApi
