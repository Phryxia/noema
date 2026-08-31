import type { ColumnPair } from './computeMappingTuples'
import { computeMappingTuples } from './computeMappingTuples'

export function checkMappingReady(
  matrix: string[][],
  columnPairs?: ColumnPair[] | null,
): boolean {
  const hasUnnamedColumn = matrix[0].some(
    (header, columnIndex) => !header && checkColumnHasData(matrix, columnIndex),
  )
  if (hasUnnamedColumn) {
    return false
  }
  return computeMappingTuples(matrix, columnPairs).length > 0
}

function checkColumnHasData(matrix: string[][], columnIndex: number): boolean {
  return matrix.slice(1).some((row) => !!row[columnIndex])
}
