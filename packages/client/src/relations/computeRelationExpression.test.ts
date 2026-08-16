import { describe, expect, it } from 'vitest'
import { computeRelationExpression } from './computeRelationExpression'
import type { ExpressionToken } from './types'

const base = { relationId: 1, questionId: 1, createdAt: new Date(0) }

function word(wordId: number): ExpressionToken {
  return { kind: 'word', id: wordId }
}

function text(value: string): ExpressionToken {
  return { kind: 'text', value }
}

describe('computeRelationExpression', () => {
  it('단어 설명과 예문 만들기는 단어들을 +로 잇고 답을 붙인다', () => {
    expect(
      computeRelationExpression({
        ...base,
        type: 'WordExplain',
        wordId: 1,
        answer: { type: 'sentence', id: 9 },
      }),
    ).toEqual([word(1), text(': '), { kind: 'sentence', id: 9 }])
    expect(
      computeRelationExpression({
        ...base,
        type: 'WordsUsage',
        wordIds: [1, 2, 3],
        answer: null,
      }),
    ).toEqual([word(1), text(' + '), word(2), text(' + '), word(3), text(': '), text('회피')])
  })

  it('이항 유형은 기호로 잇는다', () => {
    const words = { word1Id: 1, word2Id: 2 }
    expect(computeRelationExpression({ ...base, type: 'UnaryProperty', ...words })).toEqual([
      word(1),
      text(' - '),
      word(2),
    ])
    expect(
      computeRelationExpression({
        ...base,
        type: 'BinaryCommon',
        ...words,
        answer: { type: 'word', id: 5 },
      }),
    ).toEqual([word(1), text(' ∩ '), word(2), text(' = '), word(5)])
    expect(
      computeRelationExpression({ ...base, type: 'BinaryDifference', ...words, answer: null }),
    ).toEqual([word(1), text(' ↔ '), word(2), text(' = '), text('회피')])
    expect(
      computeRelationExpression({ ...base, type: 'BinarySimilarity', ...words, similarity: 1 }),
    ).toEqual([text('|'), word(1), text(' - '), word(2), text('| = '), text('매우 비슷')])
    expect(computeRelationExpression({ ...base, type: 'BinaryAssociation', ...words })).toEqual(
      [word(1), text(' ~ '), word(2)],
    )
  })

  it('삼항 유형은 선택과 방향을 드러낸다', () => {
    const words = { word1Id: 1, word2Id: 2, word3Id: 3 }
    expect(
      computeRelationExpression({ ...base, type: 'TernaryIsolation', ...words, selection: 2 }),
    ).toEqual([word(1), text(', '), word(3), text(' ↔ '), word(2)])
    expect(
      computeRelationExpression({ ...base, type: 'TernaryComposition', ...words }),
    ).toEqual([word(3), text(' = '), word(1), text(' + '), word(2)])
    expect(computeRelationExpression({ ...base, type: 'NamedAssociation', ...words })).toEqual([
      word(1),
      text(' -'),
      word(3),
      text('→ '),
      word(2),
    ])
  })

  it('문장 추출은 문장 @ 문서다', () => {
    expect(
      computeRelationExpression({
        relationId: 1,
        createdAt: new Date(0),
        type: 'DocumentToSentence',
        documentId: 4,
        sentenceId: 7,
      }),
    ).toEqual([{ kind: 'sentence', id: 7 }, text(' @ '), { kind: 'document', id: 4 }])
  })
})
