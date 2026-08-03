import { LabQuestionTypes } from './consts'
import { proposePair } from './model/proposePair'
import type { EmbeddingModel } from './model/types'
import { pickQuestion } from '../../explore/pickQuestion'
import type { QuestionPick } from '../../explore/types'
import type { QuestionType } from '../../question/types'
import type { WordTrie } from '../../word/getWordTrie'
import { getWordValues } from '../../word/getWordValues'

export async function pickLabQuestion(
  model: EmbeddingModel | null,
  trie: WordTrie | null,
  labeledPairs: Set<string>,
  types: QuestionType[],
): Promise<QuestionPick> {
  const labTypes = LabQuestionTypes.filter((type) => types.includes(type))
  if (!model || !trie || !labTypes.length) {
    return pickQuestion(labTypes)
  }
  const pair = proposePair(model, trie, labeledPairs)
  if (!pair) {
    return pickQuestion(labTypes)
  }
  const [word1Id, word2Id] = shufflePair(pair)
  const values = await getWordValues([word1Id, word2Id])
  const type = labTypes[Math.floor(Math.random() * labTypes.length)]
  return {
    status: 'ok',
    draft: {
      question: { type, word1Id, word2Id },
      lexes: [
        { nodeId: word1Id, value: values[0] },
        { nodeId: word2Id, value: values[1] },
      ],
    },
  }
}

function shufflePair([a, b]: [number, number]): [number, number] {
  if (Math.random() < 0.5) {
    return [a, b]
  }
  return [b, a]
}
