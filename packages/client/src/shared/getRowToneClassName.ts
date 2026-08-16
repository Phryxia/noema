import classnames from 'classnames/bind'
import styles from './RowTone.module.css'

const cx = classnames.bind(styles)

export type RowTone = 'success' | 'warning' | 'error'

export function getRowToneClassName(tone?: RowTone): string {
  if (!tone) {
    return ''
  }
  return cx(tone)
}
