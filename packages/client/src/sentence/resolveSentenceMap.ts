import { getSentence } from './sentence.service'

export async function resolveSentenceMap(sentenceIds: number[]): Promise<Map<number, string>> {
  const sentences = await Promise.all(sentenceIds.map((id) => getSentence(id)))
  return new Map(sentenceIds.map((id, index) => [id, sentences[index]?.value ?? '']))
}
