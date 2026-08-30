export function computeMappingTuples(matrix: string[][]): string[][] {
  const tuples: string[][] = []
  const seenKeys = new Set<string>()
  for (let i = 1; i < matrix.length; i += 1) {
    for (let j = 0; j < matrix[i].length; j += 1) {
      if (!matrix[i][j]) {
        continue
      }
      for (let k = 0; k < matrix[i].length; k += 1) {
        if (j === k || !matrix[i][k] || !matrix[0][k]) {
          continue
        }
        const tuple = [matrix[i][j], matrix[i][k], matrix[0][k]]
        const key = tuple.join('\t')
        if (seenKeys.has(key)) {
          continue
        }
        seenKeys.add(key)
        tuples.push(tuple)
      }
    }
  }
  return tuples
}
