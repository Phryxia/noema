import type { ReactElement, ReactNode, Ref } from 'react'
import classnames from 'classnames/bind'
import styles from './FieldRow.module.css'

const cx = classnames.bind(styles)

interface FieldRowProps {
  ref?: Ref<HTMLDivElement>
  weight?: number
  children: ReactNode
}

export function FieldRow({ ref, weight, children }: FieldRowProps): ReactElement {
  return (
    <div ref={ref} className={cx('row')} style={weight ? { flex: `${weight} 1 0` } : undefined}>
      {children}
    </div>
  )
}

interface FieldEdgeProps {
  children: ReactNode
}

export function FieldEdge({ children }: FieldEdgeProps): ReactElement {
  return (
    <span className={cx('edge')} aria-hidden>
      {children}
    </span>
  )
}
