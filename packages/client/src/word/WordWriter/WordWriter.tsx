import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WORD_NODE_ID_QUERY_KEY } from '../consts'
import { createWord, getWordNodeId } from '../word.service'
import { invalidateWordQueries } from '../utils'
import { WordField } from '../WordField/WordField'
import { WordSuggestion } from '../WordSuggestion/WordSuggestion'
import { useThrottledValue } from '../../utils/useThrottledValue'
import classNames from 'classnames/bind'
import styles from './WordWriter.module.css'

const cx = classNames.bind(styles)

interface WordWriterProps {
  isEditable: boolean
}

export function WordWriter({ isEditable }: WordWriterProps): ReactElement {
  const [value, setValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const queryClient = useQueryClient()
  const { mutate: saveWord, isPending } = useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      setValue('')
      invalidateWordQueries(queryClient)
    },
  })

  const throttledValue = useThrottledValue(value, 250)
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
          <WordField
            value={value}
            isEditable={isEditable}
            onChange={setValue}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
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
      <WordSuggestion keyword={value} n={16} isVisible={isFocused} />
    </div>
  )
}
