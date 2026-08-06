export const EXPLORE_SOURCE_PREFIX = 'Harvest via NOEMA system exploration'

export function createSource(questionId: number, prefix: string): string {
  return `${prefix}, qid=${questionId}`
}
