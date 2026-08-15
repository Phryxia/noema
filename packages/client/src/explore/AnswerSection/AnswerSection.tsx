import type { ReactElement, SetStateAction } from 'react'
import { useRef } from 'react'
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup'
import type { Choice } from '../ChoiceGroup/ChoiceGroup'
import { TextWriterField } from '../TextWriterField/TextWriterField'
import { SimilarityLevels } from '../consts'
import { getAnswerMode, getAnswerModes } from '../getAnswerModes'
import type { AnswerDraft, QuestionDraft } from '../types'
import { SubjectWordFields } from '../../relation/SubjectWordFields/SubjectWordFields'
import type { Similarity } from '../../relation/types'
import { focusNextElement } from '../../utils/focusNextElement'

interface AnswerSectionProps {
  draft: QuestionDraft
  answer: AnswerDraft
  onChange: (answer: AnswerDraft) => void
}

export function AnswerSection({ draft, answer, onChange }: AnswerSectionProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)

  if (draft.question.type === 'BinarySimilarity') {
    return (
      <ChoiceGroup
        choices={SimilarityLevels}
        selected={answer.similarity}
        hasKeyboardShortcut
        onSelect={(similarity: Similarity) => onChange({ ...answer, similarity })}
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
      />
    )
  }

  if (draft.question.type === 'TernaryComposition') {
    return (
      <SubjectWordFields
        words={answer.words}
        requiredCount={2}
        layout="composition"
        onChange={(update) =>
          onChange({ ...answer, words: resolveWords(update, answer.words) })
        }
      />
    )
  }

  return (
    <div ref={rootRef}>
      <TextWriterField
        name="answerMode"
        modes={getAnswerModes(draft.question.type)}
        mode={getAnswerMode(draft.question.type, answer.mode)}
        value={answer.text}
        onModeChange={(mode) => onChange({ ...answer, mode })}
        onChange={(text) => onChange({ ...answer, text })}
        onComplete={() => focusNextElement(rootRef.current)}
      />
    </div>
  )
}

function resolveWords(update: SetStateAction<string[]>, words: string[]): string[] {
  return typeof update === 'function' ? update(words) : update
}

function createSelectionChoices({ lexes }: QuestionDraft): Choice<1 | 2 | 3>[] {
  return [
    { label: lexes[0].value, value: 1 },
    { label: lexes[1].value, value: 2 },
    { label: lexes[2].value, value: 3 },
  ]
}
