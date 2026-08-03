import type { ReactElement } from 'react'
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup'
import type { Choice } from '../ChoiceGroup/ChoiceGroup'
import { TextWriterField } from '../TextWriterField/TextWriterField'
import { SimilarityLevels } from '../consts'
import { getAnswerMode, getAnswerModes } from '../getAnswerModes'
import type { AnswerDraft, QuestionDraft } from '../types'
import type { Similarity } from '../../relation/types'

interface AnswerSectionProps {
  draft: QuestionDraft
  answer: AnswerDraft
  onChange: (answer: AnswerDraft) => void
  onSubmit: () => void
}

export function AnswerSection({
  draft,
  answer,
  onChange,
  onSubmit,
}: AnswerSectionProps): ReactElement {
  if (draft.question.type === 'BinarySimilarity') {
    return (
      <ChoiceGroup
        choices={SimilarityLevels}
        selected={answer.similarity}
        hasKeyboardShortcut
        onSelect={(similarity: Similarity) => onChange({ ...answer, similarity })}
        onSubmit={onSubmit}
      />
    )
  }

  if (draft.question.type === 'TernaryIsolation') {
    return (
      <ChoiceGroup
        choices={createSelectionChoices(draft)}
        selected={answer.selection}
        hasKeyboardShortcut
        onSelect={(selection) => onChange({ ...answer, selection })}
        onSubmit={onSubmit}
      />
    )
  }

  return (
    <TextWriterField
      name="answerMode"
      modes={getAnswerModes(draft.question.type)}
      mode={getAnswerMode(draft.question.type, answer.mode)}
      value={answer.text}
      onModeChange={(mode) => onChange({ ...answer, mode })}
      onChange={(text) => onChange({ ...answer, text })}
      onSubmit={onSubmit}
    />
  )
}

function createSelectionChoices({ lexes }: QuestionDraft): Choice<1 | 2 | 3>[] {
  return [
    { label: lexes[0].value, value: 1 },
    { label: lexes[1].value, value: 2 },
    { label: lexes[2].value, value: 3 },
  ]
}
