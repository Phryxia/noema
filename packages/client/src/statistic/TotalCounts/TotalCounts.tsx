import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CountSeriesList, TOTALS_QUERY_KEY } from '../consts'
import { getTotals } from '../statistic.service'
import classnames from 'classnames/bind'
import styles from './TotalCounts.module.css'

const cx = classnames.bind(styles)

export function TotalCounts(): ReactElement {
  const { data: totals } = useQuery({
    queryKey: [TOTALS_QUERY_KEY],
    queryFn: getTotals,
  })

  return (
    <section>
      <h2>총 보유</h2>
      <div className={cx('grid')}>
        {CountSeriesList.map(({ key, label }) => (
          <div className={cx('field')} key={key}>
            <span className={cx('label')}>{label}</span>
            <strong className={cx('value')}>
              {(totals?.[key] ?? 0).toLocaleString('ko-KR')}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
