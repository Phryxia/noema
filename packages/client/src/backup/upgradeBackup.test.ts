import { describe, expect, it } from 'vitest'
import { upgradeBackup } from './upgradeBackup'
import { DB_VERSION } from '../db/consts'

describe('upgradeBackup', () => {
  it('v10 이하 백업에서 questions를 버리고 relations의 questionId를 벗긴다', () => {
    const upgraded = upgradeBackup({
      dbName: 'noema',
      version: 10,
      exportedAt: '',
      stores: {
        questions: [{ key: 1, value: { questionId: 1 } }],
        relations: [{ key: 1, value: { relationId: 1, questionId: 1, type: 'WordExplain' } }],
      },
    })
    expect(upgraded.version).toBe(DB_VERSION)
    expect(upgraded.stores).toEqual({
      relations: [{ key: 1, value: { relationId: 1, type: 'WordExplain' } }],
    })
  })

  it('현재 버전 백업은 그대로 둔다', () => {
    const backup = { dbName: 'noema', version: DB_VERSION, exportedAt: '', stores: {} }
    expect(upgradeBackup(backup)).toBe(backup)
  })
})
