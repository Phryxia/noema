import { DEFAULT_TITLE_LENGTH } from './consts'

export function createDefaultTitle(value: string, documentId: number): string {
  const title = Array.from(value.replace(/\s/g, '')).slice(0, DEFAULT_TITLE_LENGTH).join('')
  return title || `문서 ${documentId}`
}
