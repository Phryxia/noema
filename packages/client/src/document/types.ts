export interface Document {
  documentId: number
  value: string
  createdAt: Date
  modifiedAt?: Date
  source?: string
}

export interface RecentDocument {
  documentId: number
  preview: string
  createdAt: Date
}
