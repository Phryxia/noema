import type { QuestionType } from '../question/types'
import { SentenceOnlyModes, TextWriterModes } from '../writer/consts'
import type { TextWriterMode } from '../writer/types'

export function getAnswerModes(type: QuestionType): TextWriterMode[] {
  if (type === 'WordExplain' || type === 'WordsUsage') {
    return SentenceOnlyModes
  }
  return TextWriterModes
}

export function getAnswerMode(type: QuestionType, mode: TextWriterMode): TextWriterMode {
  const modes = getAnswerModes(type)
  return modes.includes(mode) ? mode : modes[0]
}
