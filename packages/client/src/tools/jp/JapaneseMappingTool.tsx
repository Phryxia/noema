import type { FormEvent, ReactElement } from 'react'
import classnames from 'classnames/bind'
import { JapaneseColumnPairs } from './consts'
import { createInitialJapaneseMatrix } from './createInitialJapaneseMatrix'
import { MatrixField } from '../i18n/MatrixField/MatrixField'
import type { MatrixHeaderOption } from '../i18n/MatrixField/types'
import { MappingResultDialog } from '../i18n/MappingResultDialog'
import type { MappingToolOptions } from '../i18n/useI18nMappingTool'
import { useI18nMappingTool } from '../i18n/useI18nMappingTool'
import { keepFieldFocus } from '../keepFieldFocus'
import styles from '../i18n/I18nMappingTool.module.css'

const cx = classnames.bind(styles)

const JapaneseHeaderOption: MatrixHeaderOption = {
  isEditable: false,
}

const JapaneseMappingOptions: MappingToolOptions = {
  createInitialMatrix: createInitialJapaneseMatrix,
  columnPairs: JapaneseColumnPairs,
}

export function JapaneseMappingTool(): ReactElement {
  const { formRef, matrix, setMatrix, result, isSubmitting, isSubmittable, save, closeResult } =
    useI18nMappingTool(JapaneseMappingOptions)

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  return (
    <section>
      <h3>일본어 매핑</h3>
      <p>
        각 행에 일본어, 読み仮名, 한국어를 적으면 일본어-&gt;한국어, 일본어-&gt;読み仮名,
        한국어-&gt;일본어 세 관계를 만듭니다.
      </p>
      <form ref={formRef} onSubmit={handleSubmit}>
        <MatrixField value={matrix} header={JapaneseHeaderOption} onChange={setMatrix} />
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
        <MappingResultDialog title="일본어 매핑 결과" result={result} onClose={closeResult} />
      )}
    </section>
  )
}
