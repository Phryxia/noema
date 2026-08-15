import type { ReactElement } from 'react'
import { FieldEdge, FieldRow } from '../FieldRow/FieldRow'
import { SentenceField } from '../../sentence/SentenceField/SentenceField'

interface BatchWordFieldsProps {
  texts: string[]
  onChange: (index: number, value: string) => void
  onSubmit: () => void
}

export function BatchWordFields({
  texts,
  onChange,
  onSubmit,
}: BatchWordFieldsProps): ReactElement {
  function createField(index: number, placeholder: string): ReactElement {
    return (
      <SentenceField
        value={texts[index]}
        isEditable
        placeholder={`${placeholder} (한 줄에 하나)`}
        onChange={(value) => onChange(index, value)}
        onSubmit={onSubmit}
      />
    )
  }

  return (
    <FieldRow>
      {createField(0, '단어 1')}
      <FieldEdge>──</FieldEdge>
      {createField(2, '관계')}
      <FieldEdge>──▶</FieldEdge>
      {createField(1, '단어 2')}
    </FieldRow>
  )
}
