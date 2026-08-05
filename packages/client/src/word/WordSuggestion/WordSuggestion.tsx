import type { ReactElement } from 'react'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WORD_SUGGESTION_QUERY_KEY } from '../consts'
import { deleteWordReplacingReferences } from '../deleteWordReplacingReferences'
import { deleteWord, getWordsByPrefix } from '../word.service'
import { invalidateWordAndQnaQueries } from '../utils'
import { useGuardedWordDeletion } from '../useGuardedWordDeletion'
import { WordReplaceDialog } from '../WordReplaceDialog/WordReplaceDialog'
import type { Lexis } from '../types'
import { useThrottledValue } from '../../utils/useThrottledValue'
import classnames from 'classnames/bind'
import styles from './WordSuggestion.module.css'

const cx = classnames.bind(styles)

interface WordSuggestionProps {
  keyword: string
  n: number
  isVisible?: boolean
  isDeletable?: boolean
  onSelect?: (word: string) => void
}

export function WordSuggestion({
  keyword,
  n,
  isVisible = true,
  isDeletable = true,
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
    mutationFn: (lexis: Lexis) => deleteWord(lexis.nodeId),
    onSuccess: () => invalidateWordAndQnaQueries(queryClient),
  })
  const { mutate: replaceWord } = useMutation({
    mutationFn: ({ lexis, replacementValue }: { lexis: Lexis; replacementValue: string }) =>
      deleteWordReplacingReferences(lexis.nodeId, replacementValue),
    onSuccess: () => invalidateWordAndQnaQueries(queryClient),
  })
  const { pendingWord, requestDelete, cancelReplace, confirmReplace } = useGuardedWordDeletion(
    (lexis, replacementValue) => {
      if (replacementValue) {
        replaceWord({ lexis, replacementValue })
        return
      }
      removeWord(lexis)
    },
  )

  if (pendingWord) {
    return (
      <WordReplaceDialog
        word={pendingWord.value}
        onCancel={cancelReplace}
        onReplace={confirmReplace}
      />
    )
  }
  if (!isVisible || !throttledKeyword || isLoading || !lexes?.length) {
    return null
  }

  return (
    <article className={cx('root')} onMouseDown={(event) => event.preventDefault()}>
      <ul className={cx('list')}>
        {lexes?.map((lexis) => (
          <li key={lexis.nodeId} className={cx('item')}>
            <WordSuggestionLabel word={lexis.value} onSelect={onSelect} />
            {isDeletable && (
              <button
                type="button"
                className={cx('deleteButton')}
                onClick={() => requestDelete(lexis)}
              >
                x
              </button>
            )}
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
