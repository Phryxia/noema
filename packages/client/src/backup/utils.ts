import { DB_NAME, DB_VERSION } from '../db/consts'
import { BACKUP_FILE_PREFIX } from './consts'
import type { NoemaBackup } from './types'

export function parseBackup(text: string): NoemaBackup {
  const parsed = readJson(text)
  if (!checkIsBackup(parsed)) {
    throw new Error('노에마 백업 파일 형식이 아닙니다')
  }
  if (parsed.dbName !== DB_NAME) {
    throw new Error(`다른 DB(${parsed.dbName})의 백업입니다`)
  }
  if (parsed.version !== DB_VERSION) {
    throw new Error(`백업의 DB 버전(${parsed.version})이 현재 버전(${DB_VERSION})과 다릅니다`)
  }
  return parsed
}

function readJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('JSON으로 읽을 수 없는 파일입니다')
  }
}

function checkIsBackup(value: unknown): value is NoemaBackup {
  if (!value || typeof value !== 'object') {
    return false
  }
  const backup = value as Partial<NoemaBackup>
  if (typeof backup.dbName !== 'string' || typeof backup.version !== 'number') {
    return false
  }
  if (!backup.stores || typeof backup.stores !== 'object') {
    return false
  }
  return Object.values(backup.stores).every((entries) => Array.isArray(entries))
}

export function createBackupFileName(date: Date): string {
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join('')
  return `${BACKUP_FILE_PREFIX}-${stamp}.json`
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다'
}
