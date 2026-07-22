import type { NoemaBackup } from './types'
import { createBackupFileName } from './utils'

export function downloadBackup(backup: NoemaBackup): void {
  const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = createBackupFileName(new Date(backup.exportedAt))
  anchor.click()
  URL.revokeObjectURL(url)
}
