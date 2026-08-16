import {
  FullWidthRanges,
  HalfWidthRanges,
  KATAKANA_SCRIPT,
  LETTER_SCRIPT,
  NUMBER_SCRIPT,
  ProlongedSoundMarks,
  ScriptNames,
  SPACE_PATTERN,
  SPACE_SCRIPT,
  SYMBOL_SCRIPT,
  UNICODE_LETTER_PATTERN,
  UNICODE_NUMBER_PATTERN,
} from './consts'

export type CharacterWidth = 'full' | 'half' | 'neutral'

export interface CharacterClass {
  script: string
  width: CharacterWidth
}

const ScriptPatterns = new Map<string, RegExp>()

export function getCharacterClass(character: string): CharacterClass {
  if (SPACE_PATTERN.test(character)) {
    return { script: SPACE_SCRIPT, width: 'neutral' }
  }
  return { script: getScriptName(character), width: getCharacterWidth(character) }
}

export function checkIsSameClass(one: CharacterClass, other: CharacterClass): boolean {
  return one.script === other.script && one.width === other.width
}

function getScriptName(character: string): string {
  if (ProlongedSoundMarks.has(character)) {
    return KATAKANA_SCRIPT
  }
  for (const name of ScriptNames) {
    if (getScriptPattern(name).test(character)) {
      return name
    }
  }
  if (UNICODE_LETTER_PATTERN.test(character)) {
    return LETTER_SCRIPT
  }
  if (UNICODE_NUMBER_PATTERN.test(character)) {
    return NUMBER_SCRIPT
  }
  return SYMBOL_SCRIPT
}

function getScriptPattern(name: string): RegExp {
  const cached = ScriptPatterns.get(name)
  if (cached) {
    return cached
  }
  const pattern = new RegExp(`\\p{Script=${name}}`, 'u')
  ScriptPatterns.set(name, pattern)
  return pattern
}

function getCharacterWidth(character: string): CharacterWidth {
  const codePoint = character.codePointAt(0)
  if (codePoint === undefined) {
    return 'neutral'
  }
  if (checkIsInRanges(codePoint, FullWidthRanges)) {
    return 'full'
  }
  if (checkIsInRanges(codePoint, HalfWidthRanges)) {
    return 'half'
  }
  return 'neutral'
}

function checkIsInRanges(codePoint: number, ranges: number[][]): boolean {
  return ranges.some(([start, end]) => codePoint >= start && codePoint <= end)
}
