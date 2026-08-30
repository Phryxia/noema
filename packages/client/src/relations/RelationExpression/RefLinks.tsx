import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import classnames from 'classnames/bind'
import { DELETED_LABEL } from '../consts'
import type { ResolvedRefToken } from '../types'
import { DocumentTitleLabel } from '../../document/DocumentTitleLabel/DocumentTitleLabel'
import { WordLink } from '../../qna/QnaCells'
import { HighlightedText } from '../../shared/HighlightedText'
import styles from './RelationExpression.module.css'

const cx = classnames.bind(styles)

interface RefLinkProps {
  token: ResolvedRefToken
  keyword?: string
}

export function WordItem({ token, keyword }: RefLinkProps): ReactElement {
  if (!token.value) {
    return <span className={cx('word', 'muted')}>{DELETED_LABEL}</span>
  }
  return (
    <span className={cx('word')}>
      <WordLink word={{ wordId: token.id, value: token.value }} keyword={keyword} />
    </span>
  )
}

export function RefItem({ token, keyword }: RefLinkProps): ReactElement {
  if (token.kind === 'word') {
    return <WordItem token={token} keyword={keyword} />
  }
  return <TruncatedLink token={token} keyword={keyword} />
}

export function TruncatedLink({ token, keyword }: RefLinkProps): ReactElement {
  if (!token.value && !token.isUntitled) {
    return <span className={cx('text', 'muted')}>{DELETED_LABEL}</span>
  }
  const label = <HighlightedText text={token.value} keyword={keyword} />
  if (token.kind === 'document') {
    return (
      <Link
        className={cx('truncated')}
        to="/document/$documentId"
        params={{ documentId: String(token.id) }}
      >
        {token.isUntitled ? <DocumentTitleLabel title={null} /> : label}
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
