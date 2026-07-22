import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import type { Pagination } from '../computePagination'
import styles from './PageNavigator.module.css'

const cx = classnames.bind(styles)

interface PageNavigatorProps {
  currentPage: number
  pagination: Pagination
  onChange: (page: number) => void
}

export function PageNavigator({
  currentPage,
  pagination,
  onChange,
}: PageNavigatorProps): ReactElement {
  const { pages, hasLeadingEllipsis, hasTrailingEllipsis, canGoPrevious, canGoNext } =
    pagination

  return (
    <nav className={cx('root')}>
      <button
        type="button"
        className="outline secondary"
        disabled={!canGoPrevious}
        onClick={() => onChange(1)}
      >
        {'<<'}
      </button>
      <button
        type="button"
        className="outline secondary"
        disabled={!canGoPrevious}
        onClick={() => onChange(currentPage - 1)}
      >
        {'<'}
      </button>
      {hasLeadingEllipsis && <span className={cx('ellipsis')}>...</span>}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={cx('page', { current: page === currentPage }, 'outline', 'secondary')}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onChange(page)}
        >
          {page}
        </button>
      ))}
      {hasTrailingEllipsis && <span className={cx('ellipsis')}>...</span>}
      <button
        type="button"
        className="outline secondary"
        disabled={!canGoNext}
        onClick={() => onChange(currentPage + 1)}
      >
        {'>'}
      </button>
    </nav>
  )
}
