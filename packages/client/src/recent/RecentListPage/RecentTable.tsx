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
  EntryLink: ComponentType<EntryLinkProps>
}

export function RecentTable({ entries, EntryLink }: RecentTableProps): ReactElement {
  if (!entries.length) {
    return <p>해당 범위에 아무것도 없습니다</p>
  }
  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          <th>내용</th>
          <th>출처</th>
          <th>날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <RecentRow key={entry.id} entry={entry} EntryLink={EntryLink} />
        ))}
      </tbody>
    </table>
  )
}

interface RecentRowProps {
  entry: RecentEntry
  EntryLink: ComponentType<EntryLinkProps>
}

function RecentRow({ entry, EntryLink }: RecentRowProps): ReactElement {
  return (
    <tr>
      <td>
        <EntryLink entry={entry}>{createPreview(entry.value, VALUE_PREVIEW_LENGTH)}</EntryLink>
      </td>
      <td>{entry.source ? createPreview(entry.source, SOURCE_PREVIEW_LENGTH) : ''}</td>
      <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
    </tr>
  )
}
