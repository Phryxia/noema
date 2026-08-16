import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { RefItem } from './RefLinks'
import type { ResolvedExtractionToken } from '../types'
import styles from './RelationExpression.module.css'

const cx = classnames.bind(styles)

interface ExtractionExpressionProps {
  token: ResolvedExtractionToken
  keyword?: string
}

export function ExtractionExpression({
  token,
  keyword,
}: ExtractionExpressionProps): ReactElement {
  return (
    <>
      <span className={cx('childArea')}>
        <RefItem token={token.child} keyword={keyword} />
      </span>
      <span className={cx('parentArea')}>
        <span className={cx('text')}>from </span>
        <RefItem token={token.parent} keyword={keyword} />
      </span>
    </>
  )
}
