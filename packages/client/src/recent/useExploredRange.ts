import { useState } from 'react'

interface ExploredRange {
  rangeKey: string
  exploredFrom: number
  exploredTo: number
  isEndReached: boolean
}

interface ExploredRangeControl extends Omit<ExploredRange, 'rangeKey'> {
  reportEnd: () => void
}

export function useExploredRange(rangeKey: string, currentPage: number): ExploredRangeControl {
  const [explored, setExplored] = useState<ExploredRange>(() =>
    createExploredRange(rangeKey, currentPage),
  )
  const adjusted = adjustExploredRange(explored, rangeKey, currentPage)
  if (adjusted !== explored) {
    setExplored(adjusted)
  }

  function reportEnd(): void {
    setExplored((previous) => {
      if (previous.isEndReached) {
        return previous
      }
      return { ...previous, isEndReached: true }
    })
  }

  return {
    exploredFrom: adjusted.exploredFrom,
    exploredTo: adjusted.exploredTo,
    isEndReached: adjusted.isEndReached,
    reportEnd,
  }
}

function createExploredRange(rangeKey: string, currentPage: number): ExploredRange {
  return {
    rangeKey,
    exploredFrom: currentPage,
    exploredTo: currentPage,
    isEndReached: false,
  }
}

function adjustExploredRange(
  explored: ExploredRange,
  rangeKey: string,
  currentPage: number,
): ExploredRange {
  if (explored.rangeKey !== rangeKey) {
    return createExploredRange(rangeKey, currentPage)
  }
  if (currentPage >= explored.exploredFrom && currentPage <= explored.exploredTo) {
    return explored
  }
  return {
    rangeKey,
    exploredFrom: Math.min(explored.exploredFrom, currentPage),
    exploredTo: Math.max(explored.exploredTo, currentPage),
    isEndReached: explored.isEndReached,
  }
}
