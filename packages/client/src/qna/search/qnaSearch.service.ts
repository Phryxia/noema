import { computeExactMatches, computePartialMatches } from './computeSearchMatches'
import type { QnaSearchSpace } from './types'
import { RELATIONS_STORE } from '../../db/consts'
import { openNoemaDB } from '../../db/openNoemaDB'
import { awaitRequest } from '../../db/utils'
import type { Relation } from '../../relation/types'
import {
  collectSentenceIds,
  collectWordIds,
  hydrateQnaEntries,
  resolveSentenceMap,
  resolveWordMap,
} from '../hydrateQnaEntries'
import type { QnaEntry } from '../types'

export async function searchExactQnaEntries(query: string): Promise<QnaEntry[]> {
  const space = await loadQnaSearchSpace()
  return hydrateQnaEntries(computeExactMatches(space, query))
}

export async function searchPartialQnaEntries(query: string): Promise<QnaEntry[]> {
  const space = await loadQnaSearchSpace()
  return hydrateQnaEntries(computePartialMatches(space, query))
}

async function loadQnaSearchSpace(): Promise<QnaSearchSpace> {
  const relations = await getAllRelations()
  const [wordMap, sentenceMap] = await Promise.all([
    resolveWordMap(collectWordIds(relations)),
    resolveSentenceMap(collectSentenceIds(relations)),
  ])
  return { relations, wordMap, sentenceMap }
}

async function getAllRelations(): Promise<Relation[]> {
  const db = await openNoemaDB()
  const store = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const [keys, values] = await Promise.all([
    awaitRequest(store.getAllKeys()),
    awaitRequest(store.getAll()),
  ])
  return values.map((stored, index) => ({
    ...(stored as Relation),
    relationId: keys[index] as number,
  }))
}
