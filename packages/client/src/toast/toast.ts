import { TOAST_EVENT_NAME } from './consts'
import type { ToastPayload, ToastTone } from './types'

export function toast(message: string, tone: ToastTone): void {
  const detail: ToastPayload = { message, tone }
  window.dispatchEvent(new CustomEvent(TOAST_EVENT_NAME, { detail }))
}
