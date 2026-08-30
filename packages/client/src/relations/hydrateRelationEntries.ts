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
import { resolveDocumentTitleMap } from '../document/resolveDocumentTitleMap'
import type { ResolvedTitle } from '../document/types'
import { resolveWordMap } from '../qna/hydrateQnaEntries'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import type { Relation } from '../relation/types'
import { resolveSentenceMap } from '../sentence/resolveSentenceMap'

interface ResolvedMaps {
  word: Map<number, string>
  sentence: Map<number, string>
  document: Map<number, ResolvedTitle>
}

export async function hydrateRelationEntries(relations: Relation[]): Promise<RelationEntry[]> {
  const expressions = relations.map(computeRelationExpression)
  const refs = expressions.flat().flatMap(getTokenRefs)
  const [word, sentence, document] = await Promise.all([
    resolveWordMap(collectIds(refs, 'word')),
    resolveSentenceMap(collectIds(refs, 'sentence')),
    resolveDocumentTitleMap(collectIds(refs, 'document')),
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
  if (token.kind === 'tag') {
    return [token.target, token.word]
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
  if (token.kind === 'tag') {
    return [
      {
        kind: 'tag',
        target: resolveRef(token.target, maps),
        word: resolveRef(token.word, maps),
      },
    ]
  }
  return [resolveRef(token, maps)]
}

function resolveRef(ref: Ref, maps: ResolvedMaps): ResolvedRefToken {
  if (ref.kind !== 'document') {
    return { ...ref, value: maps[ref.kind].get(ref.id) ?? '' }
  }
  const title = maps.document.get(ref.id)
  if (title === null) {
    return { ...ref, value: '', isUntitled: true }
  }
  return { ...ref, value: createPreview(title ?? '', VALUE_PREVIEW_LENGTH) }
}
