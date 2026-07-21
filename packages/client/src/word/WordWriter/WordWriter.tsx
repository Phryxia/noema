import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { WORD_NODE_ID_QUERY_KEY } from '../consts'
import { createWord, getWordNodeId } from '../word.service'
import { invalidateWordQueries } from '../utils'
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
  const [scrollLeft, setScrollLeft] = useState(0)
  const queryClient = useQueryClient()
  const { mutate: saveWord, isPending } = useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      setValue('')
      invalidateWordQueries(queryClient)
    },
  })

  const throttledValue = useThrottledValue(value, 100)
  const { data: existingNodeId } = useQuery({
    queryKey: [WORD_NODE_ID_QUERY_KEY, throttledValue],
    queryFn: () => getWordNodeId(throttledValue),
    enabled: !!throttledValue,
  })
  const isExisting = throttledValue === value && typeof existingNodeId === 'number'

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    if (!value || !isEditable || isPending || isExisting) {
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
            <SpaceEcho value={value} scrollLeft={scrollLeft} />
          </div>
          {isEditable && (
            <button type="submit" disabled={!value || isPending || isExisting}>
              저장
            </button>
          )}
        </fieldset>
      </form>
      <WordSuggestion keyword={value} n={16} />
    </div>
  )
}

interface SpaceEchoProps {
  value: string
  scrollLeft: number
}

function SpaceEcho({ value, scrollLeft }: SpaceEchoProps): ReactElement {
  return (
    <div className={cx('echo')}>
      <span style={{ transform: `translateX(${-scrollLeft}px)` }}>
        {value.split('').map((char, index) =>
          char === ' ' ? (
            <span key={index} className={cx('echoSpace')}>
              {' '}
            </span>
          ) : (
            <span key={index} className={cx('echoHidden')}>
              {char}
            </span>
          ),
        )}
      </span>
    </div>
  )
}
