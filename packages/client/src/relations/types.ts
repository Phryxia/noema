import type { Relation } from '../relation/types'

export interface RelationEntry {
  id: number
  type: Relation['type']
  createdAt: Date
  expression: ResolvedToken[]
}

export type ResolvedToken = TextToken | ResolvedRefToken

export type ExpressionToken = TextToken | RefToken

export interface TextToken {
  kind: 'text'
  value: string
}

export interface RefToken {
  kind: RefKind
  id: number
}

export interface ResolvedRefToken extends RefToken {
  value: string
}

export type RefKind = 'word' | 'sentence' | 'document'
