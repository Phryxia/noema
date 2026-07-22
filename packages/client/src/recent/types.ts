export interface RecentSource {
  storeName: string
  hydrate?: (entries: RecentEntry[]) => Promise<RecentEntry[]>
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

export interface RecentPage {
  entries: RecentEntry[]
  nextCursor: RecentCursor | null
}

export interface RecentRange {
  since?: Date
  until: Date
}
