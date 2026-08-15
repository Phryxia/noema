import type { FormEvent, MouseEvent, ReactElement } from 'react'
import { MIN_ORDERING_WORD_COUNT, NEXT_RELATION_NAME } from './consts'
import { useOrderingTool } from './useOrderingTool'
import { SubjectWordFields } from '../../relation/SubjectWordFields/SubjectWordFields'
import { BatchResultTable } from '../../relation/batch/BatchResultTable'

export function OrderingTool(): ReactElement {
  const { formRef, words, setWords, results, isSubmitting, isSubmittable, save } =
    useOrderingTool()

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  function keepFieldFocus(event: MouseEvent): void {
    event.preventDefault()
  }

  return (
    <section>
      <h3>순서화</h3>
      <p>
        단어를 순서대로 적으면 인접한 두 단어 사이에 &apos;{NEXT_RELATION_NAME}&apos; 관계를
        만듭니다.
      </p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <SubjectWordFields
          words={words}
          requiredCount={MIN_ORDERING_WORD_COUNT}
          isCountAdjustable
          onChange={setWords}
        />
        <button
          type="submit"
          disabled={!isSubmittable}
          aria-busy={isSubmitting}
          onMouseDown={keepFieldFocus}
        >
          {!isSubmitting && '제출'}
        </button>
      </form>
      {results && (
        <>
          <h4>삽입 결과</h4>
          <BatchResultTable entries={results} />
        </>
      )}
    </section>
  )
}
