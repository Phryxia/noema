import type { ReactElement } from 'react'
import { useEffect } from 'react'
import classnames from 'classnames/bind'
import { computeHorizontalCaret } from '../../extraction/arrowNavigation'
import { useCards } from '../../extraction/useCards'
import { WordCard } from '../../extraction/WordCard/WordCard'
import { TAG_LABEL } from '../consts'
import { normalizeTagValues } from '../normalizeTagValues'
import styles from './TagEditor.module.css'

const cx = classnames.bind(styles)

interface TagEditorProps {
  initialValues: string[]
  isEditable: boolean
  onChange: (values: string[]) => void
}

export function TagEditor({
  initialValues,
  isEditable,
  onChange,
}: TagEditorProps): ReactElement {
  const {
    cards,
    updateCard,
    splitCard,
    mergeWithPrevious,
    removeCard,
    focusAdjacentCard,
    registerElement,
  } = useCards<HTMLInputElement>(
    () => (initialValues.length ? initialValues : ['']),
    computeHorizontalCaret,
  )

  useEffect(() => {
    onChange(normalizeTagValues(cards.map((card) => card.value)))
  }, [cards, onChange])

  function removeUnlessLast(id: number): void {
    if (cards.length === 1) {
      return
    }
    removeCard(id)
  }

  return (
    <div className={cx('root')}>
      <span className={cx('label')}>{TAG_LABEL}</span>
      {!isEditable && cards.map((card) => <span key={card.id}>{card.value}</span>)}
      {isEditable &&
        cards.map((card) => (
          <WordCard
            key={card.id}
            id={card.id}
            value={card.value}
            onChange={updateCard}
            onSplit={splitCard}
            onMergeWithPrevious={mergeWithPrevious}
            onRemove={removeUnlessLast}
            onNavigate={focusAdjacentCard}
            onRegister={registerElement}
          />
        ))}
    </div>
  )
}
