export interface RecentSource<TEntry = RecentEntry, TRow = TEntry> {
  storeName: string
  toEntry: (id: number, stored: unknown) => TRow
  hydrate?: (rows: TRow[]) => Promise<TEntry[]>
}

export interface RecentEntry {
  id: number
  value: string
  createdAt: Date
  source?: string
}

export interface RecentCursor {
  createdAt: Date
  id: number
}

export interface RecentPage<TEntry = RecentEntry> {
  entries: TEntry[]
  nextCursor: RecentCursor | null
}

export interface RecentRange {
  since?: Date
  until: Date
}
