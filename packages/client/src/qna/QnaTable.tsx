import type { ReactElement, ReactNode } from 'react'
import classnames from 'classnames/bind'
import { formatMinute } from '../recent/utils'
import { RelationRow } from '../relation/RelationRow/RelationRow'
import { getRowToneClassName } from '../shared/getRowToneClassName'
import type { RowTone } from '../shared/getRowToneClassName'
import { getQuestionTypeLabel } from './labels'
import { AnswerCell, CommentCell, QuestionCell } from './QnaCells'
import type { QnaRowEntry } from './types'
import styles from './QnaTable.module.css'

const cx = classnames.bind(styles)

export type QnaRowTone = RowTone

export interface QnaNoteColumn<T> {
  header: string
  render: (entry: T) => ReactNode
}

interface QnaTableProps<T extends QnaRowEntry> {
  entries: T[]
  keyword?: string
  noteColumn?: QnaNoteColumn<T>
  getRowTone?: (entry: T) => QnaRowTone
}

export function QnaTable<T extends QnaRowEntry>({
  entries,
  keyword,
  noteColumn,
  getRowTone,
}: QnaTableProps<T>): ReactElement {
  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          <th className={cx('type')}>유형</th>
          <th className={cx('question')}>문제</th>
          <th className={cx('answer')}>응답</th>
          <th className={cx('comment')}>{noteColumn?.header ?? '참고'}</th>
          <th className={cx('date')}>날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry, index) => (
          <QnaRow
            key={index}
            entry={entry}
            keyword={keyword}
            note={
              noteColumn ? (
                noteColumn.render(entry)
              ) : (
                <CommentCell comment={entry.comment} keyword={keyword} />
              )
            }
            tone={getRowTone?.(entry)}
          />
        ))}
      </tbody>
    </table>
  )
}

interface QnaRowProps {
  entry: QnaRowEntry
  keyword?: string
  note: ReactNode
  tone?: QnaRowTone
}

function QnaRow({ entry, keyword, note, tone }: QnaRowProps): ReactElement {
  return (
    <RelationRow relationId={entry.id} className={getRowToneClassName(tone)}>
      <td className={cx('type')}>{getQuestionTypeLabel(entry.type)}</td>
      <td className={cx('question')}>
        <QuestionCell words={entry.words} keyword={keyword} />
      </td>
      <td className={cx('answer')}>
        <AnswerCell answer={entry.answer} keyword={keyword} />
      </td>
      <td className={cx('comment')}>{note}</td>
      <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
    </RelationRow>
  )
}
