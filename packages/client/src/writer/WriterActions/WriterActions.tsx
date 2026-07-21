import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import styles from './WriterActions.module.css'

const cx = classnames.bind(styles)

interface WriterActionsProps {
  isEditing: boolean
  canSave: boolean
  onDelete: () => void
}

export function WriterActions({
  isEditing,
  canSave,
  onDelete,
}: WriterActionsProps): ReactElement {
  return (
    <div className={cx('actions')}>
      <button type="submit" className={cx('action')} disabled={!canSave}>
        {isEditing ? '수정' : '저장'}
      </button>
      {isEditing && (
        <button type="button" className={cx('action', 'secondary')} onClick={onDelete}>
          삭제
        </button>
      )}
    </div>
  )
}
