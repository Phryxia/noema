import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { TruncatedLink } from './RefLinks'
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
      <span className={cx('sentenceArea')}>
        <TruncatedLink token={token.sentence} keyword={keyword} />
      </span>
      <span className={cx('documentArea')}>
        <span className={cx('text')}>from </span>
        <TruncatedLink token={token.document} keyword={keyword} />
      </span>
    </>
  )
}
