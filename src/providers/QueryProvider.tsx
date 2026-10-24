'use client'

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { handleUnauthorized } from '@/features/auth/lib/session'
import { isUnauthorized } from '@/lib/api'

export default function QueryProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [queryClient] = useState(() => {
    const onError = (error: Error) => {
      if (isUnauthorized(error)) handleUnauthorized(client, router)
    }

    const client = new QueryClient({
      queryCache: new QueryCache({ onError }),
      mutationCache: new MutationCache({
        onError: (error, _variables, _onMutateResult, mutation) => {
          if (!mutation.meta?.ignoreUnauthorized) onError(error)
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          retry: (failureCount, error) =>
            !isUnauthorized(error) && failureCount < 3,
        },
      },
    })

    return client
  })

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
