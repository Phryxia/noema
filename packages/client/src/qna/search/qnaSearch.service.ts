import { computeExactMatches, computePartialMatches } from './computeSearchMatches'
import type { QnaSearchSpace } from './types'
import { RELATIONS_STORE } from '../../db/consts'
import { openNoemaDB } from '../../db/openNoemaDB'
import { awaitRequest } from '../../db/utils'
import { checkIsWordRelation } from '../../relation/checkIsWordRelation'
import type { Relation, WordRelation } from '../../relation/types'
import { resolveSentenceMap } from '../../sentence/resolveSentenceMap'
import {
  collectSentenceIds,
  collectWordIds,
  hydrateQnaEntries,
  resolveWordMap,
} from '../hydrateQnaEntries'
import type { QnaEntry } from '../types'

export async function searchExactQnaEntries(query: string): Promise<QnaEntry[]> {
  return hydrateQnaEntries(await searchExactRelations(query))
}

export async function searchExactRelations(query: string): Promise<WordRelation[]> {
  const space = await loadQnaSearchSpace()
  return computeExactMatches(space, query)
}

export async function searchPartialRelations(query: string): Promise<WordRelation[]> {
  const space = await loadQnaSearchSpace()
  return computePartialMatches(space, query)
}

async function loadQnaSearchSpace(): Promise<QnaSearchSpace> {
  const relations = await getAllRelations()
  const [wordMap, sentenceMap] = await Promise.all([
    resolveWordMap(collectWordIds(relations)),
    resolveSentenceMap(collectSentenceIds(relations)),
  ])
  return { relations, wordMap, sentenceMap }
}

async function getAllRelations(): Promise<WordRelation[]> {
  const db = await openNoemaDB()
  const store = db.transaction(RELATIONS_STORE).objectStore(RELATIONS_STORE)
  const [keys, values] = await Promise.all([
    awaitRequest(store.getAllKeys()),
    awaitRequest(store.getAll()),
  ])
  return values
    .map((stored, index): Relation => ({
      ...(stored as Relation),
      relationId: keys[index] as number,
    }))
    .filter(checkIsWordRelation)
}
