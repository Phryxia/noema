import type { FormEvent, ReactElement } from 'react'
import classnames from 'classnames/bind'
import { MatrixField } from './MatrixField/MatrixField'
import { MappingResultDialog } from './MappingResultDialog'
import { useI18nMappingTool } from './useI18nMappingTool'
import { keepFieldFocus } from '../keepFieldFocus'
import styles from './I18nMappingTool.module.css'

const cx = classnames.bind(styles)

export function I18nMappingTool(): ReactElement {
  const { formRef, matrix, setMatrix, result, isSubmitting, isSubmittable, save, closeResult } =
    useI18nMappingTool()

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
        <MatrixField
          value={matrix}
          createHeaderPlaceholder={(columnIndex) => `언어${columnIndex + 1}`}
          onChange={setMatrix}
        />
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
      {result && <MappingResultDialog result={result} onClose={closeResult} />}
    </section>
  )
}
