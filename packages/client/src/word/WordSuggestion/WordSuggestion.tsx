import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WORD_SUGGESTION_QUERY_KEY } from '../consts'
import { deleteWord, getWordsByPrefix } from '../word.service'
import { invalidateWordQueries } from '../utils'
import { useThrottledValue } from '../../utils/useThrottledValue'
import classnames from 'classnames/bind'
import styles from './WordSuggestion.module.css'

const cx = classnames.bind(styles)

interface WordSuggestionProps {
  keyword: string
  n: number
  onSelect?: (word: string) => void
}

export function WordSuggestion({
  keyword,
  n,
  onSelect,
}: WordSuggestionProps): ReactElement | null {
  const throttledKeyword = useThrottledValue(keyword, 100)
  const queryClient = useQueryClient()
  const { data: lexes, isLoading } = useQuery({
    queryKey: [WORD_SUGGESTION_QUERY_KEY, throttledKeyword, n],
    queryFn: () => getWordsByPrefix(throttledKeyword, n),
    enabled: !!throttledKeyword,
  })
  const { mutate: removeWord } = useMutation({
    mutationFn: deleteWord,
    onSuccess: () => invalidateWordQueries(queryClient),
  })

  if (!throttledKeyword || isLoading || !lexes?.length) {
    return null
  }

  return (
    <article className={cx('root')} onMouseDown={(event) => event.preventDefault()}>
      <ul className={cx('list')}>
        {lexes?.map((lexis) => (
          <li key={lexis.nodeId} className={cx('item')}>
            <WordSuggestionLabel word={lexis.value} onSelect={onSelect} />
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

interface WordSuggestionLabelProps {
  word: string
  onSelect?: (word: string) => void
}

function WordSuggestionLabel({ word, onSelect }: WordSuggestionLabelProps): ReactElement {
  if (onSelect) {
    return (
      <button type="button" className={cx('selectButton')} onClick={() => onSelect(word)}>
        {word}
      </button>
    )
  }

  return (
    <Link to="/word/$word" params={{ word }}>
      {word}
    </Link>
  )
}
