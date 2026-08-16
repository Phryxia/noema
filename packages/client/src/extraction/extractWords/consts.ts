export const ITERATION_MARK = '々'

export const ProlongedSoundMarks = new Set(['ー', 'ｰ'])

export const SPACE_SCRIPT = 'space'
export const KATAKANA_SCRIPT = 'Katakana'
export const HAN_SCRIPT = 'Han'
export const HIRAGANA_SCRIPT = 'Hiragana'
export const LETTER_SCRIPT = 'letter'
export const NUMBER_SCRIPT = 'number'
export const SYMBOL_SCRIPT = 'symbol'

export const ScriptNames = [
  'Latin',
  HAN_SCRIPT,
  'Hangul',
  HIRAGANA_SCRIPT,
  KATAKANA_SCRIPT,
  'Cyrillic',
  'Greek',
  'Arabic',
  'Hebrew',
  'Thai',
  'Devanagari',
  'Armenian',
  'Georgian',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Gujarati',
  'Gurmukhi',
  'Oriya',
  'Sinhala',
  'Khmer',
  'Lao',
  'Myanmar',
  'Tibetan',
  'Mongolian',
  'Ethiopic',
  'Cherokee',
  'Syriac',
  'Thaana',
  'Bopomofo',
]

export const FullWidthRanges = [
  [0xff01, 0xff60],
  [0xffe0, 0xffe6],
]

export const HalfWidthRanges = [
  [0xff61, 0xffdc],
  [0xffe8, 0xffee],
]

export const NUMBER_LITERAL_PATTERN =
  /0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/y

export const LINE_BREAK_PATTERN = /\r\n?|\n/g
export const TAB_PATTERN = /\t+/g
export const SPACE_PATTERN = /\s/
export const UNICODE_LETTER_PATTERN = /\p{L}/u
export const UNICODE_NUMBER_PATTERN = /\p{N}/u
