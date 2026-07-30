import { WORD_NODES_STORE } from '../db/consts'
import { toRecentEntry } from '../recent/recent.service'
import type { RecentEntry, RecentSource } from '../recent/types'
import { getWordValues } from './getWordValues'

export const RecentWordSource: RecentSource = {
  storeName: WORD_NODES_STORE,
  toEntry: toRecentEntry,
  hydrate: restoreEntryValues,
}

async function restoreEntryValues(entries: RecentEntry[]): Promise<RecentEntry[]> {
  const values = await getWordValues(entries.map((entry) => entry.id))
  return entries.map((entry, index) => ({
    id: entry.id,
    value: values[index],
    createdAt: entry.createdAt,
  }))
}
