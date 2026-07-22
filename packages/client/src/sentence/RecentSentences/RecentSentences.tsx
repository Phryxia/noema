import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RecentLines } from '../../recent/RecentLines/RecentLines'
import { RECENT_SENTENCES_QUERY_KEY } from '../consts'
import { getRecentSentences } from '../sentence.service'

export function RecentSentences(): ReactElement {
  const { data: recentSentences } = useQuery({
    queryKey: [RECENT_SENTENCES_QUERY_KEY],
    queryFn: getRecentSentences,
  })

  return (
    <RecentLines title={<Link to="/recent/sentences">최근에 추가된 문장</Link>}>
      {recentSentences?.map((sentence) => (
        <li key={sentence.sentenceId}>
          <Link to="/sentence/$sentenceId" params={{ sentenceId: String(sentence.sentenceId) }}>
            {sentence.value}
          </Link>
        </li>
      ))}
    </RecentLines>
  )
}
