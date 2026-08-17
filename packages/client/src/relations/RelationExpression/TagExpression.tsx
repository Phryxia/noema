import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { TruncatedLink, WordItem } from './RefLinks'
import type { ResolvedTagToken } from '../types'
import styles from './RelationExpression.module.css'

const cx = classnames.bind(styles)

interface TagExpressionProps {
  token: ResolvedTagToken
  keyword?: string
}

export function TagExpression({ token, keyword }: TagExpressionProps): ReactElement {
  return (
    <>
      <span className={cx('targetArea')}>
        <TruncatedLink token={token.target} keyword={keyword} />
      </span>
      <span className={cx('text')}> ~ </span>
      <WordItem token={token.word} keyword={keyword} />
    </>
  )
}
