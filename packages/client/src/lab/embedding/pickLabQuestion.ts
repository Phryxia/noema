import { LabQuestionTypes } from './consts'
import { proposePair } from './model/proposePair'
import type { EmbeddingModel } from './model/types'
import { pickQuestion } from '../../explore/pickQuestion'
import type { QuestionPick } from '../../explore/types'
import { getAllWordNodeIds } from '../../word/getAllWordNodeIds'
import { getWordValues } from '../../word/getWordValues'

export async function pickLabQuestion(
  model: EmbeddingModel | null,
  labeledPairs: Set<string>,
): Promise<QuestionPick> {
  if (!model) {
    return pickQuestion(LabQuestionTypes)
  }
  const allNodeIds = await getAllWordNodeIds()
  const pair = proposePair(model, allNodeIds, labeledPairs)
  if (!pair) {
    return pickQuestion(LabQuestionTypes)
  }
  const [word1Id, word2Id] = shufflePair(pair)
  const values = await getWordValues([word1Id, word2Id])
  const type = LabQuestionTypes[Math.floor(Math.random() * LabQuestionTypes.length)]
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
