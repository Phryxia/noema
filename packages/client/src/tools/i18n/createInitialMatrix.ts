const INITIAL_MATRIX_ROWS = 3
const INITIAL_MATRIX_COLUMNS = 2

export function createInitialMatrix(): string[][] {
  return Array.from({ length: INITIAL_MATRIX_ROWS }, () =>
    Array.from({ length: INITIAL_MATRIX_COLUMNS }, () => ''),
  )
}
