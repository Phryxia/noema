export type ToastTone = 'success' | 'error'

export interface ToastPayload {
  message: string
  tone: ToastTone
}

export interface Toast extends ToastPayload {
  id: number
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      successMessage?: string
    }
  }
}
