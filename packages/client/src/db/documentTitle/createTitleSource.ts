import { TITLE_SOURCE_PREFIX } from './consts'

export function createTitleSource(documentId: number): string {
  return `${TITLE_SOURCE_PREFIX}, did=${documentId}`
}
