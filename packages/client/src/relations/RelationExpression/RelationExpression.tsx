import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { ExtractionExpression } from './ExtractionExpression'
import { RefItem } from './RefLinks'
import { TagExpression } from './TagExpression'
import { UsageExpression } from './UsageExpression'
import type { ResolvedToken } from '../types'
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
    return <span className={cx('text', { muted: token.isMuted })}>{token.value}</span>
  }
  if (token.kind === 'usage') {
    return <UsageExpression token={token} keyword={keyword} />
  }
  if (token.kind === 'extraction') {
    return <ExtractionExpression token={token} keyword={keyword} />
  }
  if (token.kind === 'tag') {
    return <TagExpression token={token} keyword={keyword} />
  }
  return <RefItem token={token} keyword={keyword} />
}
