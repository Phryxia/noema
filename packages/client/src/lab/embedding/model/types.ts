export interface WordEmbedding {
  mu: number[]
  varr: number[]
}

export interface EmbeddingModel {
  d: number
  words: Map<number, WordEmbedding>
}

export interface BinaryExample {
  word1Id: number
  word2Id: number
  label: 0 | 1
}
