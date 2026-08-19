import { RECENT_PAGE_SIZE } from './consts'
import type { RecentStart } from './types'

export type RowVerdict = 'skip' | 'collect' | 'stop'

export type RowJudge<TRow> = (row: TRow, collectedCount: number) => RowVerdict

export function createRowJudge<TRow>(
  start: RecentStart,
  accept?: (row: TRow) => boolean,
): RowJudge<TRow> {
  let remainingSkip = accept && start.kind === 'offset' ? start.offset : 0

  return (row, collectedCount) => {
    if (accept && !accept(row)) {
      return 'skip'
    }
    if (remainingSkip > 0) {
      remainingSkip -= 1
      return 'skip'
    }
    if (collectedCount === RECENT_PAGE_SIZE) {
      return 'stop'
    }
    return 'collect'
  }
}
