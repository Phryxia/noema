export interface DimRange {
  dMin: number
  dMax: number
  dResolution: number
}

export function computeDims(range: DimRange): number[] | null {
  if (!checkIsValidDimRange(range)) {
    return null
  }
  const { dMin, dMax, dResolution } = range
  if (dResolution === 1) {
    return [dMin]
  }
  const dims = new Set<number>()
  for (let i = 0; i < dResolution; i++) {
    dims.add(Math.round(dMin + (i * (dMax - dMin)) / (dResolution - 1)))
  }
  return [...dims]
}

export function checkIsValidDimRange({ dMin, dMax, dResolution }: DimRange): boolean {
  if (!Number.isInteger(dMin) || !Number.isInteger(dMax) || !Number.isInteger(dResolution)) {
    return false
  }
  return 1 <= dMin && dMin <= dMax && 1 <= dResolution && dResolution < dMax - dMin + 1
}
