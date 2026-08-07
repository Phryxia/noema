import type { KeyboardEvent, ReactElement, Ref } from 'react'
import { Link } from '@tanstack/react-router'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  onExitUp?: () => void
  ref?: Ref<HTMLElement>
}

export function WordSuggestion({
  keyword,
  n,
  isVisible = true,
  isDeletable = true,
  onSelect,
  onExitUp,
  ref,
}: WordSuggestionProps): ReactElement | null {
  const throttledKeyword = useThrottledValue(keyword, 100)
  const queryClient = useQueryClient()
  const { data: lexes, isLoading } = useQuery({
    queryKey: [WORD_SUGGESTION_QUERY_KEY, throttledKeyword, n],
    queryFn: () => getWordsByPrefix(throttledKeyword, n),
    enabled: !!throttledKeyword,
    placeholderData: keepPreviousData,
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

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>('li > :first-child')]
    const index = items.findIndex((item) => item === event.target)
    if (index < 0) {
      return
    }
    event.preventDefault()
    if (event.key === 'ArrowDown') {
      const nextItem = items[index + 1] ?? items[0]
      nextItem.focus()
      return
    }
    if (index === 0) {
      onExitUp?.()
      return
    }
    items[index - 1].focus()
  }

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
    <article ref={ref} className={cx('root')} onMouseDown={(event) => event.preventDefault()}>
      <ul className={cx('list')} onKeyDown={handleListKeyDown}>
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
