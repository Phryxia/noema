import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RECENT_WORDS_QUERY_KEY } from '../consts'
import { getRecentWords } from '../word.service'
import classnames from 'classnames/bind'
import styles from './RecentWords.module.css'

const cx = classnames.bind(styles)

export function RecentWords(): ReactElement {
  const { data: recentWords } = useQuery({
    queryKey: [RECENT_WORDS_QUERY_KEY],
    queryFn: getRecentWords,
  })

  return (
    <section className={cx('root')}>
      <h2>
        <Link to="/recent/words">최근에 추가된 단어</Link>
      </h2>
      <ul className={cx('list')}>
        {recentWords?.map((word) => (
          <li key={word.nodeId}>
            <Link to="/word/$word" params={{ word: word.value }}>
              {word.value}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
