export interface NoemaBackup {
  dbName: string
  version: number
  exportedAt: string
  stores: Record<string, BackupEntry[]>
}

export interface BackupEntry {
  key: unknown
  value: unknown
}
