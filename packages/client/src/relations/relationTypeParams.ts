import { RelationTypeOptions } from './consts'
import type { Relation } from '../relation/types'

type RelationType = Relation['type']

const RelationTypes = new Set<string>(RelationTypeOptions.map((option) => option.value))

export function parseRelationTypes(value: unknown): RelationType[] {
  if (typeof value !== 'string') {
    return []
  }
  const types: RelationType[] = []
  value.split(',').forEach((piece) => {
    const candidate = piece.trim()
    if (checkIsRelationType(candidate) && !types.includes(candidate)) {
      types.push(candidate)
    }
  })
  return types
}

export function serializeRelationTypes(types: RelationType[]): string | undefined {
  if (!types.length) {
    return undefined
  }
  return types.join(',')
}

function checkIsRelationType(value: string): value is RelationType {
  return RelationTypes.has(value)
}
