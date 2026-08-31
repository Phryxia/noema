export type ColumnPair = [number, number]

export function computeMappingTuples(
  matrix: string[][],
  columnPairs?: ColumnPair[] | null,
): string[][] {
  const pairs = columnPairs ?? createAllColumnPairs(matrix[0].length)
  const tuples: string[][] = []
  const seenKeys = new Set<string>()
  for (let i = 1; i < matrix.length; i += 1) {
    for (const [from, to] of pairs) {
      if (!matrix[i][from] || !matrix[i][to] || !matrix[0][to]) {
        continue
      }
      const tuple = [matrix[i][from], matrix[i][to], matrix[0][to]]
      const key = tuple.join('\t')
      if (seenKeys.has(key)) {
        continue
      }
      seenKeys.add(key)
      tuples.push(tuple)
    }
  }
  return tuples
}

function createAllColumnPairs(columnCount: number): ColumnPair[] {
  const pairs: ColumnPair[] = []
  for (let from = 0; from < columnCount; from += 1) {
    for (let to = 0; to < columnCount; to += 1) {
      if (from === to) {
        continue
      }
      pairs.push([from, to])
    }
  }
  return pairs
}
