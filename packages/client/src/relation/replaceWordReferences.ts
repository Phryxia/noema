import { RELATIONS_STORE } from '../db/consts'
import { awaitRequest } from '../db/utils'
import { CompoundWordIndexNames, NumericWordIndexNames } from './consts'
import type { Relation, WordOrSentence } from './types'

export async function replaceWordReferences(
  transaction: IDBTransaction,
  fromId: number,
  toId: number,
): Promise<void> {
  const relationStore = transaction.objectStore(RELATIONS_STORE)
  const targets = new Map<number, Relation>()

  for (const indexName of NumericWordIndexNames) {
    await collectRelations(relationStore.index(indexName), fromId, targets)
  }
  for (const indexName of CompoundWordIndexNames) {
    await collectRelations(relationStore.index(indexName), ['word', fromId], targets)
  }

  targets.forEach((relation) => {
    replaceIdsInRelation(relation, fromId, toId)
    relationStore.put(relation)
  })
}

async function collectRelations(
  index: IDBIndex,
  key: IDBValidKey,
  targets: Map<number, Relation>,
): Promise<void> {
  const relations = await awaitRequest<Relation[]>(index.getAll(key))
  relations.forEach((relation) => targets.set(relation.relationId, relation))
}

function replaceIdsInRelation(relation: Relation, fromId: number, toId: number): void {
  if ('wordId' in relation && relation.wordId === fromId) {
    relation.wordId = toId
  }
  if ('wordIds' in relation) {
    relation.wordIds = relation.wordIds.map((wordId) => (wordId === fromId ? toId : wordId))
  }
  if ('word1Id' in relation && relation.word1Id === fromId) {
    relation.word1Id = toId
  }
  if ('word2Id' in relation && relation.word2Id === fromId) {
    relation.word2Id = toId
  }
  if ('word3Id' in relation && relation.word3Id === fromId) {
    relation.word3Id = toId
  }
  if ('answer' in relation) {
    replaceWordRef(relation.answer, fromId, toId)
  }
  if ('comment' in relation) {
    replaceWordRef(relation.comment, fromId, toId)
  }
}

function replaceWordRef(
  ref: WordOrSentence | null | undefined,
  fromId: number,
  toId: number,
): void {
  if (ref?.type === 'word' && ref.id === fromId) {
    ref.id = toId
  }
}
