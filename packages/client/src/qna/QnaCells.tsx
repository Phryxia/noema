import { Fragment } from 'react'
import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import { getSimilarityLabel } from './labels'
import type { QnaAnswer, ResolvedText, ResolvedWord } from './types'

interface QuestionCellProps {
  words: ResolvedWord[]
}

export function QuestionCell({ words }: QuestionCellProps): ReactElement {
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && ', '}
          <WordLink word={word} />
        </Fragment>
      ))}
    </>
  )
}

interface AnswerCellProps {
  answer: QnaAnswer
}

export function AnswerCell({ answer }: AnswerCellProps): ReactElement {
  if (answer.kind === 'skip') {
    return <>회피</>
  }
  if (answer.kind === 'similarity') {
    return <>{getSimilarityLabel(answer.similarity)}</>
  }
  if (answer.kind === 'selection') {
    return <WordLink word={answer.word} />
  }
  return <ResolvedTextLink text={answer.text} />
}

interface CommentCellProps {
  comment: ResolvedText | null
}

export function CommentCell({ comment }: CommentCellProps): ReactElement {
  if (!comment) {
    return <></>
  }
  return <ResolvedTextLink text={comment} />
}

interface WordLinkProps {
  word: ResolvedWord
}

function WordLink({ word }: WordLinkProps): ReactElement {
  if (!word.value) {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/word/$word" params={{ word: word.value }}>
      {word.value}
    </Link>
  )
}

interface ResolvedTextLinkProps {
  text: ResolvedText
}

function ResolvedTextLink({ text }: ResolvedTextLinkProps): ReactElement {
  if (text.type === 'word') {
    return <WordLink word={text.word} />
  }
  if (!text.value) {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/sentence/$sentenceId" params={{ sentenceId: String(text.sentenceId) }}>
      {createPreview(text.value, VALUE_PREVIEW_LENGTH)}
    </Link>
  )
}
