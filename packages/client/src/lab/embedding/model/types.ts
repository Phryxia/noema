export interface NodeEmbedding {
  mu: number[]
  varr: number[]
}

export type WordEmbedding = NodeEmbedding

export interface EmbeddingModel {
  d: number
  bias: number
  nodes: Map<number, NodeEmbedding>
}

export interface BinaryExample {
  word1Id: number
  word2Id: number
  label: 0 | 1
}
