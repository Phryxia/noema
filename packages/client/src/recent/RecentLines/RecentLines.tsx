import type { ReactElement, ReactNode } from 'react'
import classnames from 'classnames/bind'
import styles from './RecentLines.module.css'

const cx = classnames.bind(styles)

interface RecentLinesProps {
  title: ReactNode
  children: ReactNode
}

export function RecentLines({ title, children }: RecentLinesProps): ReactElement {
  return (
    <section className={cx('root')}>
      <h2>{title}</h2>
      <ul className={cx('list')}>{children}</ul>
    </section>
  )
}
