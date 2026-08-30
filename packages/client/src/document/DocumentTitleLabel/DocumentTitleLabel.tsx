import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import { VALUE_PREVIEW_LENGTH } from '../../recent/consts'
import { createPreview } from '../../recent/utils'
import { UNTITLED_LABEL } from '../consts'
import styles from './DocumentTitleLabel.module.css'

const cx = classnames.bind(styles)

interface DocumentTitleLabelProps {
  title: string | null
}

export function DocumentTitleLabel({ title }: DocumentTitleLabelProps): ReactElement {
  if (title === null) {
    return <span className={cx('muted')}>{UNTITLED_LABEL}</span>
  }
  return <>{createPreview(title, VALUE_PREVIEW_LENGTH)}</>
}
