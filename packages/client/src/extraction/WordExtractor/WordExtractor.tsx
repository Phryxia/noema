import type { ReactElement } from 'react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames/bind'
import { computeHorizontalCaret } from '../arrowNavigation'
import { extractWords } from '../extractWords/extractWords'
import { submitWordExtraction } from '../submitWordExtraction'
import type { WordExtractionResult } from '../submitWordExtraction'
import { useCards } from '../useCards'
import { WordCard } from '../WordCard/WordCard'
import { WordExtractionDialog } from '../WordExtractionDialog/WordExtractionDialog'
import { invalidateRelationQueries } from '../../relation/utils'
import type { Sentence } from '../../sentence/types'
import { toast } from '../../toast/toast'
import styles from './WordExtractor.module.css'

const cx = classnames.bind(styles)

interface WordExtractorProps {
  sentence: Sentence
  onClose: () => void
}

export function WordExtractor({ sentence, onClose }: WordExtractorProps): ReactElement {
  const {
    cards,
    updateCard,
    splitCard,
    mergeWithPrevious,
    removeCard,
    focusAdjacentCard,
    registerElement,
  } = useCards<HTMLInputElement>(() => extractWords(sentence.value), computeHorizontalCaret)
  const [results, setResults] = useState<WordExtractionResult[] | null>(null)
  const queryClient = useQueryClient()

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: () =>
      submitWordExtraction(
        sentence.sentenceId,
        cards.map((card) => card.value),
      ),
    onSuccess: (entries) => {
      setResults(entries)
      invalidateRelationQueries(queryClient)
      const linkedCount = entries.filter((entry) => entry.outcome.kind !== 'failure').length
      if (linkedCount) {
        toast(`단어 ${linkedCount}개를 연결했습니다`, 'success')
      }
    },
  })
  const isSubmittable = !isSubmitting && cards.some((card) => card.value)

  return (
    <>
      <p>
        <small>
          병합: 카드 맨 앞에서 Backspace를 누르면 앞 카드에 붙는다.
          <br />
          분할: 쪼갤 자리에서 Enter를 누른다.
          <br />
          삭제: 빈 카드에서 Backspace를 누른다.
          <br />
          이동: 카드의 끝/처음에서 좌우 화살표 키를 누른다.
        </small>
      </p>
      <div className={cx('cards')}>
        {cards.map((card) => (
          <WordCard
            key={card.id}
            id={card.id}
            value={card.value}
            onChange={updateCard}
            onSplit={splitCard}
            onMergeWithPrevious={mergeWithPrevious}
            onRemove={removeCard}
            onNavigate={focusAdjacentCard}
            onRegister={registerElement}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={!isSubmittable}
        aria-busy={isSubmitting}
        onClick={() => submit()}
      >
        {!isSubmitting && '제출'}
      </button>
      {results && <WordExtractionDialog results={results} onClose={onClose} />}
    </>
  )
}
