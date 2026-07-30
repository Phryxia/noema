import type { ComponentType, ReactElement, ReactNode } from 'react'
import classnames from 'classnames/bind'
import { SOURCE_PREVIEW_LENGTH, VALUE_PREVIEW_LENGTH } from '../consts'
import type { RecentEntry } from '../types'
import { createPreview, formatMinute } from '../utils'
import styles from './RecentTable.module.css'

const cx = classnames.bind(styles)

export interface EntryLinkProps {
  entry: RecentEntry
  children: ReactNode
}

interface RecentTableProps {
  entries: RecentEntry[]
  hasSource: boolean
  EntryLink: ComponentType<EntryLinkProps>
}

export function RecentTable({ entries, hasSource, EntryLink }: RecentTableProps): ReactElement {
  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          <th className={cx('value')}>내용</th>
          {hasSource && <th className={cx('source')}>출처</th>}
          <th className={cx('date')}>날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <RecentRow key={entry.id} entry={entry} hasSource={hasSource} EntryLink={EntryLink} />
        ))}
      </tbody>
    </table>
  )
}

interface RecentRowProps {
  entry: RecentEntry
  hasSource: boolean
  EntryLink: ComponentType<EntryLinkProps>
}

function RecentRow({ entry, hasSource, EntryLink }: RecentRowProps): ReactElement {
  return (
    <tr>
      <td className={cx('value')}>
        <EntryLink entry={entry}>{createPreview(entry.value, VALUE_PREVIEW_LENGTH)}</EntryLink>
      </td>
      {hasSource && (
        <td className={cx('source')}>
          {entry.source ? createPreview(entry.source, SOURCE_PREVIEW_LENGTH) : ''}
        </td>
      )}
      <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
    </tr>
  )
}
