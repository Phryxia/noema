import { describe, expect, it } from 'vitest'
import { parseRelationTypes, serializeRelationTypes } from './relationTypeParams'

describe('parseRelationTypes', () => {
  it('문자열이 아니면 빈 배열이다', () => {
    expect(parseRelationTypes(undefined)).toEqual([])
    expect(parseRelationTypes(3)).toEqual([])
    expect(parseRelationTypes(['WordExplain'])).toEqual([])
  })

  it('쉼표로 나누고 공백을 다듬는다', () => {
    expect(parseRelationTypes(' WordExplain , Tag ')).toEqual(['WordExplain', 'Tag'])
  })

  it('알려지지 않은 유형은 버린다', () => {
    expect(parseRelationTypes('xyz,Tag,')).toEqual(['Tag'])
    expect(parseRelationTypes('')).toEqual([])
  })

  it('중복을 없애되 순서는 지킨다', () => {
    expect(parseRelationTypes('Tag,WordExplain,Tag')).toEqual(['Tag', 'WordExplain'])
  })
})

describe('serializeRelationTypes', () => {
  it('빈 배열은 undefined다', () => {
    expect(serializeRelationTypes([])).toBeUndefined()
  })

  it('파싱과 왕복한다', () => {
    const types = ['SentenceToWord', 'BinaryCommon', 'DocumentTitle'] as const
    const serialized = serializeRelationTypes(types.slice())
    expect(serialized).toBe('SentenceToWord,BinaryCommon,DocumentTitle')
    expect(parseRelationTypes(serialized)).toEqual(types)
  })
})
