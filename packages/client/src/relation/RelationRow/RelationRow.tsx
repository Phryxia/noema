import type { MouseEvent, ReactElement, ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import classnames from 'classnames/bind'
import styles from './RelationRow.module.css'

const cx = classnames.bind(styles)

interface RelationRowProps {
  relationId: number | null
  className?: string
  children: ReactNode
}

export function RelationRow({
  relationId,
  className,
  children,
}: RelationRowProps): ReactElement {
  const navigate = useNavigate()
  const isNavigable = relationId !== null

  function handleClick(event: MouseEvent<HTMLTableRowElement>): void {
    if (!isNavigable || (event.target as HTMLElement).closest('a')) {
      return
    }
    navigate({
      to: '/relation/$relationId',
      params: { relationId: String(relationId) },
      search: true,
    })
  }

  return (
    <tr className={cx(className, { navigable: isNavigable })} onClick={handleClick}>
      {children}
    </tr>
  )
}
