export interface Relation {
  relationId: number
  labelNodeId: number
  from: RelationTarget
  to: RelationTarget
  createdAt: Date
  modifiedAt?: Date
}

export interface RelationTarget {
  type: 'word' | 'sentence' | 'document' | 'relation'
  id: number
}
