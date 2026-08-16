import { computeRelationExpression } from './computeRelationExpression'
import { DELETED_LABEL } from './consts'
import { createUsageFallbackTokens } from './createUsageFallbackTokens'
import { splitSentenceByWords } from './splitSentenceByWords'
import type {
  ExpressionToken,
  RefKind,
  RelationEntry,
  ResolvedRefToken,
  ResolvedToken,
} from './types'
import { resolveDocumentMap } from '../document/resolveDocumentMap'
import { resolveWordMap } from '../qna/hydrateQnaEntries'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import type { Relation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

type ResolvedMaps = Record<RefKind, Map<number, string>>

export async function hydrateRelationEntries(relations: Relation[]): Promise<RelationEntry[]> {
  const expressions = relations.map(computeRelationExpression)
  const refs = expressions.flat().flatMap(getTokenRefs)
  const [word, sentence, document] = await Promise.all([
    resolveWordMap(collectIds(refs, 'word')),
    resolveSentenceMap(collectIds(refs, 'sentence')),
    resolveDocumentMap(collectIds(refs, 'document')),
  ])
  const maps: ResolvedMaps = { word, sentence, document }
  return relations.map((relation, index) => ({
    id: relation.relationId,
    type: relation.type,
    createdAt: relation.createdAt,
    expression: expressions[index].flatMap((token) => resolveTokens(token, maps)),
  }))
}

interface Ref {
  kind: RefKind
  id: number
}

function getTokenRefs(token: ExpressionToken): Ref[] {
  if (token.kind === 'text') {
    return []
  }
  if (token.kind === 'usage') {
    return [
      { kind: 'sentence', id: token.sentenceId },
      ...token.wordIds.map((id): Ref => ({ kind: 'word', id })),
    ]
  }
  if (token.kind === 'extraction') {
    return [token.child, token.parent]
  }
  return [token]
}

function collectIds(refs: Ref[], kind: RefKind): number[] {
  const ids = new Set<number>()
  for (const ref of refs) {
    if (ref.kind === kind) {
      ids.add(ref.id)
    }
  }
  return Array.from(ids)
}

function resolveTokens(token: ExpressionToken, maps: ResolvedMaps): ResolvedToken[] {
  if (token.kind === 'text') {
    return [token]
  }
  if (token.kind === 'usage') {
    const value = maps.sentence.get(token.sentenceId) ?? ''
    if (!value) {
      return createUsageFallbackTokens(
        { kind: 'text', value: DELETED_LABEL, isMuted: true },
        token.wordIds,
      ).flatMap((fallback) => resolveTokens(fallback, maps))
    }
    const words = token.wordIds.map((id) => resolveRef({ kind: 'word', id }, maps))
    return [
      {
        kind: 'usage',
        sentenceId: token.sentenceId,
        value,
        segments: splitSentenceByWords(value, words),
      },
    ]
  }
  if (token.kind === 'extraction') {
    return [
      {
        kind: 'extraction',
        child: resolveRef(token.child, maps),
        parent: resolveRef(token.parent, maps),
      },
    ]
  }
  return [resolveRef(token, maps)]
}

function resolveRef(ref: Ref, maps: ResolvedMaps): ResolvedRefToken {
  const value = maps[ref.kind].get(ref.id) ?? ''
  if (ref.kind === 'document') {
    return { ...ref, value: createPreview(value, VALUE_PREVIEW_LENGTH) }
  }
  return { ...ref, value }
}
