import { registerSW } from 'virtual:pwa-register'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from './toast/toast'
import { getErrorMessage } from './utils/getErrorMessage'
import '@picocss/pico/css/pico.conditional.min.css'
import './global.css'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

import { routeTree } from './routeTree.gen'

registerSW({ immediate: true })

const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL })
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation): void => {
      const message = mutation.meta?.successMessage
      if (message) {
        toast(message, 'success')
      }
    },
    onError: (error): void => {
      toast(getErrorMessage(error), 'error')
    },
  }),
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
