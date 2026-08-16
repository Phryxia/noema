import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import classnames from 'classnames/bind'
import type { ResolvedUsageToken, UsageSegment } from '../types'
import { WordLink } from '../../qna/QnaCells'
import { HighlightedText } from '../../shared/HighlightedText'
import styles from './RelationExpression.module.css'

const cx = classnames.bind(styles)

interface UsageExpressionProps {
  token: ResolvedUsageToken
  keyword?: string
}

export function UsageExpression({ token, keyword }: UsageExpressionProps): ReactElement {
  return (
    <span className={cx('truncated')}>
      {token.segments.map((segment, index) => (
        <UsageSegmentItem
          key={index}
          segment={segment}
          sentenceId={token.sentenceId}
          keyword={keyword}
        />
      ))}
    </span>
  )
}

interface UsageSegmentItemProps {
  segment: UsageSegment
  sentenceId: number
  keyword?: string
}

function UsageSegmentItem({
  segment,
  sentenceId,
  keyword,
}: UsageSegmentItemProps): ReactElement {
  if (segment.kind === 'text') {
    return (
      <Link to="/sentence/$sentenceId" params={{ sentenceId: String(sentenceId) }}>
        <HighlightedText text={segment.value} keyword={keyword} />
      </Link>
    )
  }
  return (
    <em>
      <strong>
        <WordLink word={{ wordId: segment.id, value: segment.value }} keyword={keyword} />
      </strong>
    </em>
  )
}
