import type { RelationQuestion, Similarity } from '../relation/types'
import type { Lexis } from '../word/types'
import type { TextWriterMode } from '../writer/types'

export interface QuestionDraft {
  question: RelationQuestion
  lexes: Lexis[]
}

export type QuestionPick =
  { status: 'ok'; draft: QuestionDraft } | { status: 'noType' } | { status: 'noWord' }

export interface AnswerDraft {
  mode: TextWriterMode
  text: string
  similarity: Similarity | null
  selection: 1 | 2 | 3 | null
  words: string[]
}

export interface CommentDraft {
  mode: TextWriterMode
  text: string
}
