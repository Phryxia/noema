import type { NewQuestion } from '../question/types'

export function getQuestionPrompt(question: NewQuestion): string {
  switch (question.type) {
    case 'WordExplain':
      return '다음 단어의 뜻을 적으세요.'
    case 'WordsUsage':
      return getUsagePrompt(question.wordIds.length)
    case 'UnaryProperty':
      return '다음 단어가 갖는 속성을 적으세요.'
    case 'BinaryCommon':
      return '다음 두 단어의 공통점을 적으세요.'
    case 'BinaryDifference':
      return '다음 두 단어의 차이점을 적으세요.'
    case 'BinarySimilarity':
      return '다음 두 단어는 얼마나 비슷한가요?'
    case 'BinaryAssociation':
      return '다음 단어를 보고 연상되는 단어를 적으세요.'
    case 'TernaryIsolation':
      return '다음 세 단어 중 가장 이질적인 단어를 고르세요.'
    case 'TernaryComposition':
      return '다음 단어를 두 단어의 합으로 나타내세요.'
    case 'NamedAssociation':
      return '두 단어와 둘을 잇는 관계를 나타내는 단어를 적으세요.'
  }
}

function getUsagePrompt(wordCount: number): string {
  if (wordCount === 1) {
    return '다음 단어를 사용하여 문장을 만드세요.'
  }
  return '다음 단어들을 사용하여 문장을 만드세요. 너무 이상해서 만들기가 어려우면 빈 문장을 제출하세요.'
}
