import type { ReactElement } from 'react'
import { useEffect, useRef, useState } from 'react'
import { MAX_TOAST_COUNT, TOAST_DURATION_MS, TOAST_EVENT_NAME } from '../consts'
import type { Toast, ToastPayload } from '../types'
import classnames from 'classnames/bind'
import styles from './ToastStack.module.css'

const cx = classnames.bind(styles)

export function ToastStack(): ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextIdRef = useRef(0)

  useEffect(() => {
    const timeoutIds = new Set<number>()

    function removeToast(id: number): void {
      setToasts((currentToasts) => currentToasts.filter((current) => current.id !== id))
    }

    function appendToast(event: Event): void {
      const { message, tone } = (event as CustomEvent<ToastPayload>).detail
      const id = nextIdRef.current
      nextIdRef.current += 1
      setToasts((currentToasts) =>
        currentToasts.concat({ id, message, tone }).slice(-MAX_TOAST_COUNT),
      )
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId)
        removeToast(id)
      }, TOAST_DURATION_MS)
      timeoutIds.add(timeoutId)
    }

    window.addEventListener(TOAST_EVENT_NAME, appendToast)
    return (): void => {
      window.removeEventListener(TOAST_EVENT_NAME, appendToast)
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [])

  return (
    <div className={'pico ' + cx('root')} role="status" aria-live="polite">
      {toasts.map(({ id, message, tone }) => (
        <article key={id} className={cx('toast', tone)}>
          {message}
        </article>
      ))}
    </div>
  )
}
