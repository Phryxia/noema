import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RECENT_SENTENCES_QUERY_KEY } from '../consts'
import { getRecentSentences } from '../sentence.service'
import classnames from 'classnames/bind'
import styles from './RecentSentences.module.css'

const cx = classnames.bind(styles)

export function RecentSentences(): ReactElement {
  const { data: recentSentences } = useQuery({
    queryKey: [RECENT_SENTENCES_QUERY_KEY],
    queryFn: getRecentSentences,
  })

  return (
    <article className={cx('root')}>
      <h2>최근에 추가된 문장</h2>
      <ul className={cx('list')}>
        {recentSentences?.map((sentence) => (
          <li key={sentence.sentenceId}>
            <Link
              to="/sentence/$sentenceId"
              params={{ sentenceId: String(sentence.sentenceId) }}
            >
              {sentence.value}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  )
}
