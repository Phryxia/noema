import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WORD_NODE_ID_QUERY_KEY } from '../consts'
import { createWord, getWordNodeId } from '../word.service'
import { invalidateWordQueries } from '../utils'
import { WordSuggestion } from '../WordSuggestion/WordSuggestion'
import { WhitespaceEcho } from '../../writer/WhitespaceEcho/WhitespaceEcho'
import { useThrottledValue } from '../../utils/useThrottledValue'
import classNames from 'classnames/bind'
import styles from './WordWriter.module.css'

const cx = classNames.bind(styles)

interface WordWriterProps {
  isEditable: boolean
}

export function WordWriter({ isEditable }: WordWriterProps): ReactElement {
  const [value, setValue] = useState('')
  const [scrollLeft, setScrollLeft] = useState(0)
  const queryClient = useQueryClient()
  const { mutate: saveWord, isPending } = useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      setValue('')
      invalidateWordQueries(queryClient)
    },
  })

  const throttledValue = useThrottledValue(value, 500)
  const { data: existingNodeId, isFetching } = useQuery({
    queryKey: [WORD_NODE_ID_QUERY_KEY, throttledValue],
    queryFn: () => getWordNodeId(throttledValue),
    enabled: !!throttledValue,
  })
  const isChecking = throttledValue !== value || isFetching
  const isExisting = !isChecking && typeof existingNodeId === 'number'
  const isSaveable = !!value && isEditable && !isPending && !isChecking && !isExisting

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    if (!isSaveable) {
      return
    }
    saveWord(value)
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <fieldset role="group" className={cx('group')}>
          <div className={cx('inputWrapper')}>
            <input
              className={cx('input')}
              type="text"
              value={value}
              readOnly={!isEditable}
              onChange={(event) => setValue(event.target.value)}
              onScroll={(event) => setScrollLeft(event.currentTarget.scrollLeft)}
            />
            <WhitespaceEcho
              value={value}
              isMultiline={false}
              scrollLeft={scrollLeft}
              scrollTop={0}
            />
          </div>
          {isEditable && (
            <button
              className={cx('save-button')}
              type="submit"
              disabled={!isSaveable}
              aria-busy={isChecking}
            >
              {!isChecking && '저장'}
            </button>
          )}
        </fieldset>
      </form>
      <WordSuggestion keyword={value} n={16} />
    </div>
  )
}
