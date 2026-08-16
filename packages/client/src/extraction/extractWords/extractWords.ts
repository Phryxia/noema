import {
  HAN_SCRIPT,
  HIRAGANA_SCRIPT,
  ITERATION_MARK,
  LINE_BREAK_PATTERN,
  NUMBER_LITERAL_PATTERN,
  TAB_PATTERN,
} from './consts'
import { checkIsSameClass, getCharacterClass } from './getCharacterClass'
import type { CharacterClass } from './getCharacterClass'

export function extractWords(text: string): string[] {
  const normalized = text.replace(LINE_BREAK_PATTERN, '').replace(TAB_PATTERN, ' ')
  const words: string[] = []
  let current = ''
  let currentClass: CharacterClass | null = null
  let index = 0

  while (index < normalized.length) {
    const literal = matchNumberLiteral(normalized, index)
    if (literal) {
      if (current) {
        words.push(current)
      }
      words.push(literal)
      current = ''
      currentClass = null
      index += literal.length
      continue
    }

    const character = getCharacterAt(normalized, index)
    const nextClass = getNextClass(character, currentClass)
    if (currentClass && checkNeedsCut(currentClass, nextClass)) {
      words.push(current)
      current = ''
    }
    current += character
    currentClass = nextClass
    index += character.length
  }

  if (current) {
    words.push(current)
  }
  return words
}

function matchNumberLiteral(text: string, index: number): string | null {
  NUMBER_LITERAL_PATTERN.lastIndex = index
  const matched = NUMBER_LITERAL_PATTERN.exec(text)
  return matched?.[0] ?? null
}

function getCharacterAt(text: string, index: number): string {
  const codePoint = text.codePointAt(index)
  if (codePoint === undefined) {
    return ''
  }
  return String.fromCodePoint(codePoint)
}

function getNextClass(character: string, currentClass: CharacterClass | null): CharacterClass {
  if (character === ITERATION_MARK && currentClass) {
    return currentClass
  }
  return getCharacterClass(character)
}

function checkNeedsCut(from: CharacterClass, to: CharacterClass): boolean {
  if (checkIsSameClass(from, to)) {
    return false
  }
  if (from.width !== to.width) {
    return true
  }
  return !(from.script === HAN_SCRIPT && to.script === HIRAGANA_SCRIPT)
}
