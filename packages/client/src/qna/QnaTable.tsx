import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { formatMinute } from '../recent/utils'
import { getQuestionTypeLabel } from './labels'
import { AnswerCell, CommentCell, QuestionCell } from './QnaCells'
import type { QnaEntry } from './types'
import styles from './QnaTable.module.css'

const cx = classnames.bind(styles)

interface QnaTableProps {
  entries: QnaEntry[]
}

export function QnaTable({ entries }: QnaTableProps): ReactElement {
  return (
    <table className={cx('root')}>
      <thead>
        <tr>
          <th className={cx('type')}>유형</th>
          <th className={cx('question')}>문제</th>
          <th className={cx('answer')}>응답</th>
          <th className={cx('comment')}>참고</th>
          <th className={cx('date')}>날짜</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <QnaRow key={entry.id} entry={entry} />
        ))}
      </tbody>
    </table>
  )
}

interface QnaRowProps {
  entry: QnaEntry
}

function QnaRow({ entry }: QnaRowProps): ReactElement {
  return (
    <tr>
      <td className={cx('type')}>{getQuestionTypeLabel(entry.type)}</td>
      <td className={cx('question')}>
        <QuestionCell words={entry.words} />
      </td>
      <td className={cx('answer')}>
        <AnswerCell answer={entry.answer} />
      </td>
      <td className={cx('comment')}>
        <CommentCell comment={entry.comment} />
      </td>
      <td className={cx('date')}>{formatMinute(entry.createdAt)}</td>
    </tr>
  )
}
