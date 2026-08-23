export const EXPLORE_SOURCE_PREFIX = 'Harvest via NOEMA system exploration'

export function createSource(relationId: number, prefix: string): string {
  return `${prefix}, rid=${relationId}`
}
