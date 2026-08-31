import type { FormEvent, ReactElement } from 'react'
import classnames from 'classnames/bind'
import { createInitialMatrix } from './createInitialMatrix'
import { MatrixField } from './MatrixField/MatrixField'
import type { MatrixHeaderOption } from './MatrixField/types'
import { MappingResultDialog } from './MappingResultDialog'
import type { MappingToolOptions } from './useI18nMappingTool'
import { useI18nMappingTool } from './useI18nMappingTool'
import { keepFieldFocus } from '../keepFieldFocus'
import styles from './I18nMappingTool.module.css'

const cx = classnames.bind(styles)

const I18nHeaderOption: MatrixHeaderOption = {
  isEditable: true,
  createPlaceholder: (columnIndex) => `언어${columnIndex + 1}`,
}

const I18nMappingOptions: MappingToolOptions = {
  createInitialMatrix,
  columnPairs: null,
}

export function I18nMappingTool(): ReactElement {
  const { formRef, matrix, setMatrix, result, isSubmitting, isSubmittable, save, closeResult } =
    useI18nMappingTool(I18nMappingOptions)

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  return (
    <section>
      <h3>다국어 매핑</h3>
      <p>
        각 열에 같은 언어, 각 행에 같은 의미의 단어를 적으면 언어 이름을 관계로 하여 단어들을
        서로 연결합니다.
      </p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <MatrixField value={matrix} header={I18nHeaderOption} onChange={setMatrix} />
        <div className={cx('actions')}>
          <button
            type="submit"
            disabled={!isSubmittable}
            aria-busy={isSubmitting}
            onMouseDown={keepFieldFocus}
          >
            {!isSubmitting && '제출'}
          </button>
        </div>
      </form>
      {result && (
        <MappingResultDialog title="다국어 매핑 결과" result={result} onClose={closeResult} />
      )}
    </section>
  )
}
