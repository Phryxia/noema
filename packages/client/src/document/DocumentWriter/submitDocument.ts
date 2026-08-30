import { submitTags } from '../../tag/submitTags'
import type { TagEntry, TagResult } from '../../tag/types'
import { checkIsBodyChanged } from '../../writer/checkIsBodyChanged'
import { createDocument, updateDocument } from '../document.service'
import { saveDocumentTitle } from '../documentTitle.service'
import type { Document } from '../types'

export interface DocumentDraft {
  title: string
  value: string
  source: string
  tags: string[]
}

export async function submitDocument(
  document: Document | undefined,
  initialTitle: string,
  tags: TagEntry[],
  draft: DocumentDraft,
): Promise<TagResult[]> {
  const documentId = await saveDocument(document, initialTitle, draft)
  return submitTags({ type: 'document', id: documentId }, tags, draft.tags)
}

async function saveDocument(
  document: Document | undefined,
  initialTitle: string,
  draft: DocumentDraft,
): Promise<number> {
  if (!document) {
    return createDocument(draft.title, draft.value, draft.source)
  }
  const isTitleChanged = draft.title !== initialTitle
  if (isTitleChanged) {
    await saveDocumentTitle(document.documentId, draft.title)
  }
  if (isTitleChanged || checkIsBodyChanged(draft, document)) {
    await updateDocument(document.documentId, draft.value, draft.source)
  }
  return document.documentId
}
