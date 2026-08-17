import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { getRowToneClassName } from '../getRowToneClassName'
import type { RowTone } from '../getRowToneClassName'
import styles from './ResultDialog.module.css'

const cx = classnames.bind(styles)

export interface ResultRow {
  value: string
  label: string
  tone: RowTone
}

interface ResultDialogProps {
  title: string
  rows: ResultRow[]
  onClose: () => void
}

export function ResultDialog({ title, rows, onClose }: ResultDialogProps): ReactElement {
  return (
    <dialog open>
      <article>
        <h3>{title}</h3>
        <table className={cx('root')}>
          <thead>
            <tr>
              <th className={cx('word')}>단어</th>
              <th className={cx('outcome')}>결과</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={getRowToneClassName(row.tone)}>
                <td className={cx('word')}>{row.value}</td>
                <td className={cx('outcome')}>{row.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <footer>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </footer>
      </article>
    </dialog>
  )
}
