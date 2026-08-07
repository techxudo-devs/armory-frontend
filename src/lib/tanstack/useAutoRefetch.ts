import { useQuery } from '@tanstack/react-query'

interface UseAutoRefetchOptions {
  /** Unique key used by TanStack Query to track this auto-refetch subscription. */
  queryKey: string[]
  /** The RTK Query refetch function to trigger automatically. */
  refetch: () => void
  /** How long results stay "fresh" before TanStack refetches on focus/reconnect. */
  staleTime?: number
}

/**
 * Drives automatic refetching of an existing RTK Query subscription using
 * TanStack Query's window-focus / reconnect listeners. No polling.
 *
 * - Does NOT fetch on mount (RTK Query already fetched on mount).
 * - Refetches automatically when the window regains focus or the network
 *   reconnects, and only if the data is stale.
 * - RTK Query itself is left untouched — it remains the data layer.
 */
export function useAutoRefetch({
  queryKey,
  refetch,
  staleTime = 30_000,
}: UseAutoRefetchOptions) {
  useQuery({
    queryKey,
    queryFn: async () => {
      refetch()
      return null
    },
    staleTime,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
