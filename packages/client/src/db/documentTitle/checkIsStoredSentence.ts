export interface StoredSentence {
  sentenceId: number
  value: string
  createdAt?: unknown
}

export function checkIsStoredSentence(value: unknown): value is StoredSentence {
  return (
    typeof value === 'object' &&
    value !== null &&
    'sentenceId' in value &&
    typeof value.sentenceId === 'number' &&
    'value' in value &&
    typeof value.value === 'string'
  )
}
