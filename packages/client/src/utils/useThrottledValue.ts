import { useEffect, useRef, useState } from 'react'

export function useThrottledValue<T>(value: T, intervalMs: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdatedAtRef = useRef(0)

  useEffect(() => {
    function updateNow(): void {
      lastUpdatedAtRef.current = Date.now()
      setThrottledValue(value)
    }

    const elapsedMs = Date.now() - lastUpdatedAtRef.current
    if (elapsedMs >= intervalMs) {
      updateNow()
      return
    }
    const timerId = setTimeout(updateNow, intervalMs - elapsedMs)
    return (): void => clearTimeout(timerId)
  }, [value, intervalMs])

  return throttledValue
}
