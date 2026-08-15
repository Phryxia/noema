import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { DocumentCell, SentenceCell } from './D2sCells'
import type { D2sEntry } from './types'
import { formatMinute } from '../recent/utils'
import { RelationRow } from '../relation/RelationRow/RelationRow'
import styles from './D2sTable.module.css'

const cx = classnames.bind(styles)

export type D2sColumn = 'document' | 'sentence'

interface D2sTableProps {
  entries: D2sEntry[]
  hiddenColumn?: D2sColumn
}

export function D2sTable({ entries, hiddenColumn }: D2sTableProps): ReactElement {
  const hasDocument = hiddenColumn !== 'document'
  const hasSentence = hiddenColumn !== 'sentence'

  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          {hasDocument && <th className={cx('text')}>문서</th>}
          {hasSentence && <th className={cx('text')}>문장</th>}
          <th className={cx('date')}>날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <RelationRow key={entry.id} relationId={entry.id}>
            {hasDocument && (
              <td className={cx('text')}>
                <DocumentCell document={entry.document} />
              </td>
            )}
            {hasSentence && (
              <td className={cx('text')}>
                <SentenceCell sentence={entry.sentence} />
              </td>
            )}
            <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
          </RelationRow>
        ))}
      </tbody>
    </table>
  )
}
