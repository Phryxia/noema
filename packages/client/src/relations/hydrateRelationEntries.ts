import { computeRelationExpression } from './computeRelationExpression'
import type { ExpressionToken, RefKind, RelationEntry, ResolvedToken } from './types'
import { resolveDocumentMap } from '../document/resolveDocumentMap'
import { resolveWordMap } from '../qna/hydrateQnaEntries'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import type { Relation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

type ResolvedMaps = Record<RefKind, Map<number, string>>

export async function hydrateRelationEntries(relations: Relation[]): Promise<RelationEntry[]> {
  const expressions = relations.map(computeRelationExpression)
  const tokens = expressions.flat()
  const [word, sentence, document] = await Promise.all([
    resolveWordMap(collectIds(tokens, 'word')),
    resolveSentenceMap(collectIds(tokens, 'sentence')),
    resolveDocumentMap(collectIds(tokens, 'document')),
  ])
  const maps: ResolvedMaps = { word, sentence, document }
  return relations.map((relation, index) => ({
    id: relation.relationId,
    type: relation.type,
    createdAt: relation.createdAt,
    expression: expressions[index].map((token) => resolveToken(token, maps)),
  }))
}

function collectIds(tokens: ExpressionToken[], kind: RefKind): number[] {
  const ids = new Set<number>()
  for (const token of tokens) {
    if (token.kind === kind) {
      ids.add(token.id)
    }
  }
  return Array.from(ids)
}

function resolveToken(token: ExpressionToken, maps: ResolvedMaps): ResolvedToken {
  if (token.kind === 'text') {
    return token
  }
  const value = maps[token.kind].get(token.id) ?? ''
  if (token.kind === 'document') {
    return { ...token, value: createPreview(value, VALUE_PREVIEW_LENGTH) }
  }
  return { ...token, value }
}
