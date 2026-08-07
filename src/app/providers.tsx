'use client'

import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { store } from '@/lib/store'
import { queryClient } from '@/lib/tanstack/queryClient'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
}
