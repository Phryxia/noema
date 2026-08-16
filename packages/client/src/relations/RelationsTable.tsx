import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import classnames from 'classnames/bind'
import { getRelationTypeLabel } from './getRelationTypeLabel'
import { RelationExpression } from './RelationExpression/RelationExpression'
import type { RelationEntry } from './types'
import { formatMinute } from '../recent/utils'
import styles from './RelationsTable.module.css'

const cx = classnames.bind(styles)

interface RelationsTableProps {
  entries: RelationEntry[]
  keyword?: string
}

export function RelationsTable({ entries, keyword }: RelationsTableProps): ReactElement {
  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          <th className={cx('id')}>ID</th>
          <th className={cx('type')}>유형</th>
          <th className={cx('expression')}>대표 표현</th>
          <th className={cx('date')}>생성 시각</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <td className={cx('id')}>
              <Link to="/relation/$relationId" params={{ relationId: String(entry.id) }} search>
                {entry.id}
              </Link>
            </td>
            <td className={cx('type')}>{getRelationTypeLabel(entry.type)}</td>
            <td className={cx('expression')}>
              <RelationExpression tokens={entry.expression} keyword={keyword} />
            </td>
            <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
