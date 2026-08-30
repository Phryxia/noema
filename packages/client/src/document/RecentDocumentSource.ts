import { DOCUMENTS_STORE } from '../db/consts'
import { toRecentEntry } from '../recent/recent.service'
import type { RecentEntry, RecentSource } from '../recent/types'
import { resolveDocumentTitleMap } from './resolveDocumentTitleMap'

export const RecentDocumentSource: RecentSource = {
  storeName: DOCUMENTS_STORE,
  toEntry: toRecentEntry,
  hydrate: replaceValuesWithTitles,
}

async function replaceValuesWithTitles(entries: RecentEntry[]): Promise<RecentEntry[]> {
  const titleMap = await resolveDocumentTitleMap(entries.map((entry) => entry.id))
  return entries.map((entry) => ({ ...entry, value: titleMap.get(entry.id) ?? '' }))
}
