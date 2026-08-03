export interface NodeEmbedding {
  mu: number[]
  varr: number[]
}

export type WordEmbedding = NodeEmbedding

export interface BiasParameter {
  mu: number
  varr: number
}

export interface EmbeddingModel {
  d: number
  bias: BiasParameter
  nodes: Map<number, NodeEmbedding>
}

export interface BinaryExample {
  word1Id: number
  word2Id: number
  label: 0 | 1
}
