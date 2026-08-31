import type { KeyboardEvent, ReactElement } from 'react'
import classnames from 'classnames/bind'
import type { MatrixCellPosition } from './computeMatrixNavigation'
import { WordField } from '../../../word/WordField/WordField'
import { WordSuggestion } from '../../../word/WordSuggestion/WordSuggestion'
import { useSuggestionFocus } from '../../../word/useSuggestionFocus'
import styles from './MatrixField.module.css'

const cx = classnames.bind(styles)

interface MatrixCellProps {
  value: string
  rowIndex: number
  columnIndex: number
  isFixedHeader: boolean
  placeholder?: string
  onChange: (position: MatrixCellPosition, cellValue: string) => void
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>, position: MatrixCellPosition) => void
}

export function MatrixCell({
  value,
  rowIndex,
  columnIndex,
  isFixedHeader,
  placeholder,
  onChange,
  onKeyDown,
}: MatrixCellProps): ReactElement {
  const {
    rootRef,
    suggestionRef,
    isFocused,
    handleFocus,
    handleBlur,
    focusSuggestion,
    focusField,
  } = useSuggestionFocus()
  const position = { row: rowIndex, column: columnIndex }
  const canSuggest = !isFixedHeader && !!rowIndex

  function handleCellKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'ArrowDown' && !event.nativeEvent.isComposing && suggestionRef.current) {
      event.preventDefault()
      focusSuggestion()
      return
    }
    onKeyDown(event, position)
  }

  function selectSuggestion(word: string): void {
    focusField()
    onChange(position, word)
  }

  return (
    <div
      ref={rootRef}
      className={cx('cell', { header: !rowIndex })}
      style={{ gridRow: rowIndex + 3, gridColumn: columnIndex + 3 }}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {isFixedHeader ? (
        <strong className={cx('headerLabel')}>{value}</strong>
      ) : (
        <WordField
          value={value}
          isEditable
          placeholder={placeholder}
          onChange={(cellValue) => onChange(position, cellValue)}
          onKeyDown={handleCellKeyDown}
        />
      )}
      {canSuggest && (
        <WordSuggestion
          ref={suggestionRef}
          keyword={isFocused ? value : ''}
          n={8}
          isVisible={isFocused}
          isDeletable={false}
          onSelect={selectSuggestion}
          onExitUp={focusField}
        />
      )}
    </div>
  )
}
