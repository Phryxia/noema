export interface TrieNode {
  nodeId: number
  parentNodeId?: number
  value: string
  children: Record<string, number>
  createdAt?: Date
}

export interface Lexis {
  nodeId: number
  value: string
}

export interface RecentWord extends Lexis {
  createdAt: Date
}
