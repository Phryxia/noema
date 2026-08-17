import type { ReactElement } from 'react'
import { useState } from 'react'
import { getTagOutcomeLabel, TagOutcomeTones } from './getTagOutcomeLabel'
import type { TagResult } from './types'
import { ResultDialog } from '../shared/ResultDialog/ResultDialog'

interface TagResults {
  showResults: (results: TagResult[]) => void
  dialog: ReactElement | null
}

export function useTagResults(): TagResults {
  const [results, setResults] = useState<TagResult[] | null>(null)

  function showResults(next: TagResult[]): void {
    if (!next.length) {
      return
    }
    setResults(next)
  }

  const dialog = results && (
    <ResultDialog
      title="태그 결과"
      rows={results.map((result) => ({
        value: result.value,
        label: getTagOutcomeLabel(result.outcome),
        tone: TagOutcomeTones[result.outcome.kind],
      }))}
      onClose={() => setResults(null)}
    />
  )
  return { showResults, dialog }
}
