export function addRow(matrix: string[][]): string[][] {
  return matrix.concat([matrix[0].map(() => '')])
}

export function addColumn(matrix: string[][]): string[][] {
  return matrix.map((row) => row.concat(''))
}

export function removeRowAt(matrix: string[][], rowIndex: number): string[][] {
  if (matrix.length <= 1) {
    return matrix
  }
  return matrix.filter((_, index) => index !== rowIndex)
}

export function removeColumnAt(matrix: string[][], columnIndex: number): string[][] {
  if (matrix[0].length <= 1) {
    return matrix
  }
  return matrix.map((row) => row.filter((_, index) => index !== columnIndex))
}
