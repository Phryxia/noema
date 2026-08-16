import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import type { WordExtractionResult } from '../submitWordExtraction'
import { getOutcomeLabel, OutcomeTones } from '../../relation/batch/getOutcomeLabel'
import { getRowToneClassName } from '../../shared/getRowToneClassName'
import styles from './WordExtractionDialog.module.css'

const cx = classnames.bind(styles)

interface WordExtractionDialogProps {
  results: WordExtractionResult[]
  onClose: () => void
}

export function WordExtractionDialog({
  results,
  onClose,
}: WordExtractionDialogProps): ReactElement {
  return (
    <dialog open>
      <article>
        <h3>단어 추출 결과</h3>
        <table className={cx('root')}>
          <thead>
            <tr>
              <th className={cx('word')}>단어</th>
              <th className={cx('outcome')}>결과</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={index}
                className={getRowToneClassName(OutcomeTones[result.outcome.kind])}
              >
                <td className={cx('word')}>{result.value}</td>
                <td className={cx('outcome')}>{getOutcomeLabel(result.outcome)}</td>
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
