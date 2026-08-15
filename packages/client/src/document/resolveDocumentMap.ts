import { getDocument } from './document.service'

export async function resolveDocumentMap(documentIds: number[]): Promise<Map<number, string>> {
  const documents = await Promise.all(documentIds.map((id) => getDocument(id)))
  return new Map(documentIds.map((id, index) => [id, documents[index]?.value ?? '']))
}
