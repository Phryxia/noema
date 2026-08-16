import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import classnames from 'classnames/bind'
import type { ResolvedRefToken, ResolvedToken } from './types'
import { WordLink } from '../qna/QnaCells'
import { HighlightedText } from '../shared/HighlightedText'
import styles from './RelationExpression.module.css'

const cx = classnames.bind(styles)

interface RelationExpressionProps {
  tokens: ResolvedToken[]
  keyword?: string
}

export function RelationExpression({ tokens, keyword }: RelationExpressionProps): ReactElement {
  return (
    <span className={cx('root')}>
      {tokens.map((token, index) => (
        <ExpressionToken key={index} token={token} keyword={keyword} />
      ))}
    </span>
  )
}

interface ExpressionTokenProps {
  token: ResolvedToken
  keyword?: string
}

function ExpressionToken({ token, keyword }: ExpressionTokenProps): ReactElement {
  if (token.kind === 'text') {
    return <span className={cx('text')}>{token.value}</span>
  }
  if (token.kind === 'word') {
    return (
      <span className={cx('word')}>
        <WordLink word={{ wordId: token.id, value: token.value }} keyword={keyword} />
      </span>
    )
  }
  return <TruncatedLink token={token} keyword={keyword} />
}

interface TruncatedLinkProps {
  token: ResolvedRefToken
  keyword?: string
}

function TruncatedLink({ token, keyword }: TruncatedLinkProps): ReactElement {
  if (!token.value) {
    return <span className={cx('text')}>(삭제됨)</span>
  }
  const label = <HighlightedText text={token.value} keyword={keyword} />
  if (token.kind === 'document') {
    return (
      <Link
        className={cx('truncated')}
        to="/document/$documentId"
        params={{ documentId: String(token.id) }}
      >
        {label}
      </Link>
    )
  }
  return (
    <Link
      className={cx('truncated')}
      to="/sentence/$sentenceId"
      params={{ sentenceId: String(token.id) }}
    >
      {label}
    </Link>
  )
}
