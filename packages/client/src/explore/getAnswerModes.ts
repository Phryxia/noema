import type { WordRelationType } from '../relation/types'
import { SentenceOnlyModes, TextWriterModes, WordOnlyModes } from '../writer/consts'
import type { TextWriterMode } from '../writer/types'

export function getAnswerModes(type: WordRelationType): TextWriterMode[] {
  if (type === 'WordExplain' || type === 'WordsUsage') {
    return SentenceOnlyModes
  }
  if (type === 'UnaryProperty' || type === 'BinaryAssociation') {
    return WordOnlyModes
  }
  return TextWriterModes
}

export function getAnswerMode(type: WordRelationType, mode: TextWriterMode): TextWriterMode {
  const modes = getAnswerModes(type)
  return modes.includes(mode) ? mode : modes[0]
}
