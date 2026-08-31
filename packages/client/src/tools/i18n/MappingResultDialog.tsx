import type { ReactElement } from 'react'
import type { I18nMappingResult } from './submitI18nMapping'

interface MappingResultDialogProps {
  title: string
  result: I18nMappingResult
  onClose: () => void
}

export function MappingResultDialog({
  title,
  result,
  onClose,
}: MappingResultDialogProps): ReactElement {
  return (
    <dialog open>
      <article>
        <h3>{title}</h3>
        <p>
          {result.newWords.length ? `새 단어: ${result.newWords.join(', ')}` : '새 단어 없음'}
        </p>
        <p>관계 {result.relationCount}개를 추가했습니다.</p>
        <footer>
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </footer>
      </article>
    </dialog>
  )
}
