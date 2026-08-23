import type { ReactElement, SetStateAction } from 'react'
import { useRef } from 'react'
import { ChoiceGroup } from '../ChoiceGroup/ChoiceGroup'
import type { Choice } from '../ChoiceGroup/ChoiceGroup'
import { TextWriterField } from '../TextWriterField/TextWriterField'
import { SimilarityLevels } from '../consts'
import { getAnswerMode, getAnswerModes } from '../getAnswerModes'
import type { AnswerDraft, QuestionDraft } from '../types'
import { SubjectWordFields } from '../../relation/SubjectWordFields/SubjectWordFields'
import { QuestionSpecs } from '../../relation/questionSpecs'
import { resizeWords } from '../../relation/resizeWords'
import type { Similarity } from '../../relation/types'
import { focusNextElement } from '../../utils/focusNextElement'

interface AnswerSectionProps {
  draft: QuestionDraft
  answer: AnswerDraft
  onChange: (answer: AnswerDraft) => void
}

export function AnswerSection({ draft, answer, onChange }: AnswerSectionProps): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)
  const { type } = draft.question
  const spec = QuestionSpecs[type].answer

  if (spec.kind === 'similarity') {
    return (
      <ChoiceGroup
        choices={SimilarityLevels}
        selected={answer.similarity}
        hasKeyboardShortcut
        onSelect={(similarity: Similarity) => onChange({ ...answer, similarity })}
      />
    )
  }

  if (spec.kind === 'selection') {
    return (
      <ChoiceGroup
        choices={createSelectionChoices(draft)}
        selected={answer.selection}
        hasKeyboardShortcut
        onSelect={(selection) => onChange({ ...answer, selection })}
      />
    )
  }

  if (spec.kind === 'words') {
    const words = resizeWords(answer.words, spec.slots.length)
    return (
      <SubjectWordFields
        words={words}
        requiredCount={spec.slots.length}
        layout={spec.layout}
        onChange={(update) => onChange({ ...answer, words: resolveWords(update, words) })}
      />
    )
  }

  return (
    <div ref={rootRef}>
      <TextWriterField
        name="answerMode"
        modes={getAnswerModes(type)}
        mode={getAnswerMode(type, answer.mode)}
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
