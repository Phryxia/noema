import { QuestionSpecs } from '../relation/questionSpecs'
import type { WordRelationType } from '../relation/types'
import { TextWriterModes } from '../writer/consts'
import type { TextWriterMode } from '../writer/types'

export function getAnswerModes(type: WordRelationType): TextWriterMode[] {
  const { answer } = QuestionSpecs[type]
  if (answer.kind === 'text') {
    return answer.modes
  }
  return TextWriterModes
}

export function getAnswerMode(type: WordRelationType, mode: TextWriterMode): TextWriterMode {
  const modes = getAnswerModes(type)
  return modes.includes(mode) ? mode : modes[0]
}
