import { describe, expect, it } from 'vitest'
import { upgradeBackup } from './upgradeBackup'
import { DB_VERSION } from '../db/consts'

const createdAt = { $date: '2026-07-22T00:00:00.000Z' }

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
    expect(upgraded.stores.relations).toEqual([
      { key: 1, value: { relationId: 1, type: 'WordExplain' } },
    ])
    expect(upgraded.stores.questions).toBeUndefined()
  })

  it('v11 이하 백업의 문서마다 기본 제목 문장과 관계를 만들고 최근 문서의 preview를 벗긴다', () => {
    const documents = [
      { key: 1, value: { documentId: 1, value: ' 가 나\n다라마바사아자차카', createdAt } },
      { key: 2, value: { documentId: 2, value: ' \t\n', createdAt } },
    ]
    const upgraded = upgradeBackup({
      dbName: 'noema',
      version: 11,
      exportedAt: '',
      stores: {
        documents,
        sentences: [{ key: 5, value: { sentenceId: 5, value: 'x', createdAt } }],
        relations: [{ key: 7, value: { relationId: 7, type: 'WordExplain' } }],
        recentDocuments: [
          { key: 0, value: { documentId: 1, preview: '가 나', createdAt } },
          { key: 1, value: null },
          { key: 'next', value: 1 },
        ],
      },
    })
    expect(upgraded.stores.documents).toEqual(documents)
    expect(upgraded.stores.sentences).toEqual([
      { key: 5, value: { sentenceId: 5, value: 'x', createdAt } },
      {
        key: 6,
        value: {
          sentenceId: 6,
          value: '가나다라마바사아자차',
          createdAt,
          source: 'Titled via NOEMA system document, did=1',
        },
      },
      {
        key: 7,
        value: {
          sentenceId: 7,
          value: '문서 2',
          createdAt,
          source: 'Titled via NOEMA system document, did=2',
        },
      },
    ])
    expect(upgraded.stores.relations).toEqual([
      { key: 7, value: { relationId: 7, type: 'WordExplain' } },
      {
        key: 8,
        value: {
          relationId: 8,
          type: 'DocumentTitle',
          documentId: 1,
          sentenceId: 6,
          createdAt,
        },
      },
      {
        key: 9,
        value: {
          relationId: 9,
          type: 'DocumentTitle',
          documentId: 2,
          sentenceId: 7,
          createdAt,
        },
      },
    ])
    expect(upgraded.stores.recentDocuments).toEqual([
      { key: 0, value: { documentId: 1, createdAt } },
      { key: 1, value: null },
      { key: 'next', value: 1 },
    ])
    expect(
      upgraded.stores.recentSentences.map((entry) =>
        typeof entry.value === 'object' && entry.value !== null
          ? (entry.value as { sentenceId: number }).sentenceId
          : entry.value,
      ),
    ).toEqual([6, 7, null, null, 2])
  })

  it('v13 이하 백업은 제목 문장을 최근 문장 순환 큐의 가장 새것으로 넣는다', () => {
    const sentence = (sentenceId: number, day: number): object => ({
      sentenceId,
      value: `s${sentenceId}`,
      createdAt: { $date: `2026-01-0${day}T00:00:00.000Z` },
    })
    const upgraded = upgradeBackup({
      dbName: 'noema',
      version: 12,
      exportedAt: '',
      stores: {
        sentences: [
          { key: 1, value: sentence(1, 1) },
          { key: 2, value: sentence(2, 2) },
          { key: 3, value: sentence(3, 3) },
        ],
        relations: [
          {
            key: 1,
            value: { relationId: 1, type: 'DocumentTitle', documentId: 1, sentenceId: 2 },
          },
        ],
        recentSentences: [
          { key: 0, value: sentence(1, 1) },
          { key: 1, value: sentence(3, 3) },
          { key: 'next', value: 2 },
        ],
      },
    })
    expect(upgraded.stores.recentSentences).toEqual([
      { key: 0, value: sentence(1, 1) },
      { key: 1, value: sentence(3, 3) },
      { key: 2, value: sentence(2, 2) },
      { key: 3, value: null },
      { key: 'next', value: 3 },
    ])
  })

  it('v10 백업은 questions 제거와 제목 추가를 함께 겪는다', () => {
    const upgraded = upgradeBackup({
      dbName: 'noema',
      version: 10,
      exportedAt: '',
      stores: {
        questions: [{ key: 1, value: { questionId: 1 } }],
        documents: [{ key: 3, value: { documentId: 3, value: '본문', createdAt } }],
        relations: [{ key: 1, value: { relationId: 1, questionId: 1, type: 'WordExplain' } }],
      },
    })
    expect(upgraded.stores.questions).toBeUndefined()
    expect(upgraded.stores.sentences).toHaveLength(1)
    expect(upgraded.stores.relations).toEqual([
      { key: 1, value: { relationId: 1, type: 'WordExplain' } },
      {
        key: 2,
        value: {
          relationId: 2,
          type: 'DocumentTitle',
          documentId: 3,
          sentenceId: 1,
          createdAt,
        },
      },
    ])
  })

  it('문서가 없으면 문장·관계를 만들지 않는다', () => {
    const upgraded = upgradeBackup({
      dbName: 'noema',
      version: 11,
      exportedAt: '',
      stores: { documents: [], sentences: [], relations: [] },
    })
    expect(upgraded.stores.sentences).toEqual([])
    expect(upgraded.stores.relations).toEqual([])
  })

  it('현재 버전 백업은 그대로 둔다', () => {
    const backup = { dbName: 'noema', version: DB_VERSION, exportedAt: '', stores: {} }
    expect(upgradeBackup(backup)).toBe(backup)
  })
})
