import type { SentenceTagRelation, TagRelation } from '../relation/types'

export function checkIsSentenceTag(relation: TagRelation): relation is SentenceTagRelation {
  return 'sentenceId' in relation
}
