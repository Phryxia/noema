import type { ReactElement } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import classnames from 'classnames/bind'
import type { Document } from '../../document/types'
import { invalidateRelationQueries } from '../../relation/utils'
import { toast } from '../../toast/toast'
import { extractSentences } from '../extractSentences'
import { SentenceCard } from '../SentenceCard/SentenceCard'
import { submitExtraction } from '../submitExtraction'
import { useSentenceCards } from '../useSentenceCards'
import styles from './SentenceExtractor.module.css'

const cx = classnames.bind(styles)

interface SentenceExtractorProps {
  document: Document
}

export function SentenceExtractor({ document }: SentenceExtractorProps): ReactElement {
  const {
    cards,
    changeCard,
    mergeWithPrevious,
    removeCard,
    focusAdjacentCard,
    registerElement,
  } = useSentenceCards(() => extractSentences(document.value))
  const queryClient = useQueryClient()
  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: () =>
      submitExtraction(
        document.documentId,
        cards.map((card) => card.value),
      ),
    onSuccess: (count) => {
      toast(`문장 ${count}개를 저장했습니다`, 'success')
      invalidateRelationQueries(queryClient)
    },
  })
  const isSubmittable = !isSubmitting && cards.some((card) => card.value.trim())

  return (
    <>
      <p>
        <small>
          병합: 카드 맨 앞에서 Backspace를 누르면 앞 카드에 붙는다.
          <br />
          분할: 쪼갤 자리에서 Enter를 3번 누른다.
          <br />
          삭제: 빈 카드에서 Backspace를 누른다.
          <br />
          이동: 카드의 끝/처음/마지막 행/첫 행에서 화살표 키를 누른다.
        </small>
      </p>
      <div className={cx('cards')}>
        {cards.map((card) => (
          <SentenceCard
            key={card.id}
            id={card.id}
            value={card.value}
            onChange={changeCard}
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
    </>
  )
}
