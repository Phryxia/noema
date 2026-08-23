import { Fragment } from 'react'
import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { VALUE_PREVIEW_LENGTH } from '../recent/consts'
import { createPreview } from '../recent/utils'
import { HighlightedText } from '../shared/HighlightedText'
import { getSimilarityLabel } from './labels'
import type { QnaAnswer, ResolvedText, ResolvedWord } from './types'

interface QuestionCellProps {
  words: ResolvedWord[]
  keyword?: string
}

export function QuestionCell({ words, keyword }: QuestionCellProps): ReactElement {
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && ', '}
          <WordLink word={word} keyword={keyword} />
        </Fragment>
      ))}
    </>
  )
}

interface AnswerCellProps {
  answer: QnaAnswer
  keyword?: string
}

export function AnswerCell({ answer, keyword }: AnswerCellProps): ReactElement {
  if (answer.kind === 'skip') {
    return <>회피</>
  }
  if (answer.kind === 'similarity') {
    return <>{getSimilarityLabel(answer.similarity)}</>
  }
  if (answer.kind === 'selection') {
    return <WordLink word={answer.word} keyword={keyword} />
  }
  if (answer.kind === 'words') {
    return (
      <>
        {answer.words.map((word, index) => (
          <Fragment key={index}>
            {index > 0 && answer.separator}
            <WordLink word={word} keyword={keyword} />
          </Fragment>
        ))}
      </>
    )
  }
  return <ResolvedTextLink text={answer.text} keyword={keyword} />
}

interface CommentCellProps {
  comment: ResolvedText | null
  keyword?: string
}

export function CommentCell({ comment, keyword }: CommentCellProps): ReactElement {
  if (!comment) {
    return <></>
  }
  return <ResolvedTextLink text={comment} keyword={keyword} />
}

export interface WordLinkProps {
  word: ResolvedWord
  keyword?: string
}

export function WordLink({ word, keyword }: WordLinkProps): ReactElement {
  if (!word.value) {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/word/$word" params={{ word: word.value }}>
      <HighlightedText text={word.value} keyword={keyword} />
    </Link>
  )
}

interface ResolvedTextLinkProps {
  text: ResolvedText
  keyword?: string
}

function ResolvedTextLink({ text, keyword }: ResolvedTextLinkProps): ReactElement {
  if (text.type === 'word') {
    return <WordLink word={text.word} keyword={keyword} />
  }
  if (!text.value) {
    return <>(삭제됨)</>
  }
  return (
    <Link to="/sentence/$sentenceId" params={{ sentenceId: String(text.sentenceId) }}>
      <HighlightedText
        text={createPreview(text.value, VALUE_PREVIEW_LENGTH)}
        keyword={keyword}
      />
    </Link>
  )
}
