import type { Relation } from '../relation/types'

export interface RelationEntry {
  id: number
  type: Relation['type']
  createdAt: Date
  expression: ResolvedToken[]
}

export type ResolvedToken =
  TextToken | ResolvedRefToken | ResolvedUsageToken | ResolvedExtractionToken

export type ExpressionToken = TextToken | RefToken | UsageToken | ExtractionToken

export interface TextToken {
  kind: 'text'
  value: string
  isMuted?: boolean
}

export interface RefToken {
  kind: RefKind
  id: number
}

export interface ResolvedRefToken extends RefToken {
  value: string
}

export type RefKind = 'word' | 'sentence' | 'document'

export interface UsageToken {
  kind: 'usage'
  sentenceId: number
  wordIds: number[]
}

export interface ResolvedUsageToken {
  kind: 'usage'
  sentenceId: number
  value: string
  segments: UsageSegment[]
}

export type UsageSegment = TextToken | ResolvedRefToken

export interface ExtractionToken {
  kind: 'extraction'
  child: RefToken
  parent: RefToken
}

export interface ResolvedExtractionToken {
  kind: 'extraction'
  child: ResolvedRefToken
  parent: ResolvedRefToken
}
