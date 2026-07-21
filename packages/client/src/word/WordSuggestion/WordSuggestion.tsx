import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RECENT_WORDS_QUERY_KEY, WORD_SUGGESTION_QUERY_KEY } from '../consts'
import { deleteWord, getWordsByPrefix } from '../word.service'
import { useThrottledValue } from '../../utils/useThrottledValue'
import classnames from 'classnames/bind'
import styles from './WordSuggestion.module.css'

const cx = classnames.bind(styles)

interface WordSuggestionProps {
  keyword: string
  n: number
}

export function WordSuggestion({ keyword, n }: WordSuggestionProps): ReactElement {
  const throttledKeyword = useThrottledValue(keyword, 100)
  const queryClient = useQueryClient()
  const { data: lexes } = useQuery({
    queryKey: [WORD_SUGGESTION_QUERY_KEY, throttledKeyword, n],
    queryFn: () => getWordsByPrefix(throttledKeyword, n),
  })
  const { mutate: removeWord } = useMutation({
    mutationFn: deleteWord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WORD_SUGGESTION_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [RECENT_WORDS_QUERY_KEY] })
    },
  })

  return (
    <article className={cx('root')}>
      <ul className={cx('list')}>
        {lexes?.map((lexis) => (
          <li key={lexis.nodeId} className={cx('item')}>
            <Link to="/word/$word" params={{ word: lexis.value }}>
              {lexis.value}
            </Link>
            <button
              type="button"
              className={cx('deleteButton')}
              onClick={() => removeWord(lexis.nodeId)}
            >
              x
            </button>
          </li>
        ))}
      </ul>
    </article>
  )
}
