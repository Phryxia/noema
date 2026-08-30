export interface StoredDocument {
  documentId: number
  value: string
  createdAt?: unknown
}

export function checkIsStoredDocument(value: unknown): value is StoredDocument {
  return (
    typeof value === 'object' &&
    value !== null &&
    'documentId' in value &&
    typeof value.documentId === 'number' &&
    'value' in value &&
    typeof value.value === 'string'
  )
}
