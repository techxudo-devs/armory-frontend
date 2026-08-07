import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react'

export interface Pagination {
  totalDocs: number
  totalPages: number
  currentPage: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface Paginated<T> {
  items: T[]
  pagination: Pagination
}

export interface ApiErrorBody {
  message?: string
  errors?: string[]
  statusCode?: number
}

export type ApiErrorPayload = {
  status: number | undefined
  data?: ApiErrorBody
  message: string
}

interface QueryArgs {
  url: string
  method?: AxiosRequestConfig['method']
  body?: unknown
  params?: AxiosRequestConfig['params']
}

interface BaseQueryMeta {
  pagination?: Pagination
  message?: string
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const axiosBaseQuery: BaseQueryFn<
  QueryArgs,
  unknown,
  ApiErrorPayload
> = async ({ url, method = 'GET', body, params }) => {
  try {
    const headers = body instanceof FormData ? { 'Content-Type': undefined } : undefined
    const result = await axiosInstance({
      url,
      method,
      data: body,
      params,
      headers,
    })
    const envelope = result.data
    return {
      data: envelope?.data ?? envelope,
      meta: {
        pagination: envelope?.pagination,
        message: envelope?.message,
      } satisfies BaseQueryMeta,
    }
  } catch (axiosError) {
    const err = axiosError as AxiosError<ApiErrorBody>
    return {
      error: {
        status: err.response?.status,
        data: err.response?.data,
        message: err.response?.data?.message || err.message,
      },
    }
  }
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: string }).message)
  }
  return 'Something went wrong. Please try again.'
}

export const withPagination = <T>(data: T[], meta?: unknown): Paginated<T> => ({
  items: data,
  pagination: (meta as { pagination?: Pagination } | undefined)?.pagination ?? {
    totalDocs: data.length,
    totalPages: 1,
    currentPage: 1,
    limit: data.length,
    hasNextPage: false,
    hasPrevPage: false,
  },
})

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: ['Game', 'User', 'History', 'Analytics', 'Auth', 'JoinedGames', 'Notifications'],
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: () => ({}),
})
