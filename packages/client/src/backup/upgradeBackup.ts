import {
  DB_VERSION,
  LEGACY_QUESTIONS_STORE,
  QUESTION_REMOVAL_VERSION,
  RELATIONS_STORE,
} from '../db/consts'
import type { BackupEntry, NoemaBackup } from './types'

export function upgradeBackup(backup: NoemaBackup): NoemaBackup {
  if (backup.version >= DB_VERSION) {
    return backup
  }
  const stores = { ...backup.stores }
  if (backup.version < QUESTION_REMOVAL_VERSION) {
    delete stores[LEGACY_QUESTIONS_STORE]
    stores[RELATIONS_STORE] = (stores[RELATIONS_STORE] ?? []).map(removeQuestionId)
  }
  return { ...backup, version: DB_VERSION, stores }
}

function removeQuestionId(entry: BackupEntry): BackupEntry {
  const { value } = entry
  if (typeof value !== 'object' || value === null || !('questionId' in value)) {
    return entry
  }
  const { questionId: _questionId, ...rest } = value
  return { ...entry, value: rest }
}
