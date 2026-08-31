import { JAPANESE_INITIAL_DATA_ROWS, JapaneseHeaders } from './consts'

export function createInitialJapaneseMatrix(): string[][] {
  const dataRows = Array.from({ length: JAPANESE_INITIAL_DATA_ROWS }, () =>
    JapaneseHeaders.map(() => ''),
  )
  return [JapaneseHeaders.slice(), ...dataRows]
}
