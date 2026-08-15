import { describe, expect, it } from 'vitest'
import {
  createSentenceCardList,
  listCards,
  mergeWithPrevious,
  removeCard,
  splitByTripleNewline,
  splitCard,
  updateCardValue,
} from './sentenceCardList'

function values(list: ReturnType<typeof createSentenceCardList>): string[] {
  return listCards(list).map((card) => card.value)
}

describe('sentenceCardList', () => {
  it('값 목록으로 만들고 순서대로 나열한다', () => {
    const list = createSentenceCardList(['a', 'b', 'c'])
    expect(values(list)).toEqual(['a', 'b', 'c'])
    expect(createSentenceCardList([]).headId).toBeNull()
  })

  it('값을 갱신해도 다른 카드는 그대로다', () => {
    const list = updateCardValue(createSentenceCardList(['a', 'b']), 1, 'B')
    expect(values(list)).toEqual(['a', 'B'])
  })

  it('앞 카드와 구분자 없이 병합한다', () => {
    const list = mergeWithPrevious(createSentenceCardList(['a', 'b', 'c']), 1)
    expect(values(list)).toEqual(['ab', 'c'])
    expect(listCards(list).map((card) => card.id)).toEqual([0, 2])
  })

  it('첫 카드는 병합할 앞 카드가 없어 그대로다', () => {
    const list = createSentenceCardList(['a', 'b'])
    expect(mergeWithPrevious(list, 0)).toBe(list)
  })

  it('조각으로 쪼개면 새 카드가 뒤에 끼어든다', () => {
    const { list, insertedIds } = splitCard(createSentenceCardList(['a', 'z']), 0, [
      'a1',
      'a2',
      'a3',
    ])
    expect(values(list)).toEqual(['a1', 'a2', 'a3', 'z'])
    expect(insertedIds).toEqual([2, 3])
    expect(list.nextId).toBe(4)
  })

  it('조각이 하나면 값만 바뀐다', () => {
    const { list, insertedIds } = splitCard(createSentenceCardList(['a', 'z']), 0, ['A'])
    expect(values(list)).toEqual(['A', 'z'])
    expect(insertedIds).toEqual([])
  })

  it('조각이 없으면 빈 값이 된다', () => {
    const { list } = splitCard(createSentenceCardList(['a']), 0, [])
    expect(values(list)).toEqual([''])
  })

  it('카드를 지우면 앞뒤가 이어지고 머리도 갱신된다', () => {
    const list = createSentenceCardList(['a', 'b', 'c'])
    expect(values(removeCard(list, 1))).toEqual(['a', 'c'])
    expect(values(removeCard(list, 0))).toEqual(['b', 'c'])
    expect(removeCard(createSentenceCardList(['a']), 0).headId).toBeNull()
  })

  it('3연속 개행이 없으면 쪼개지 않는다', () => {
    expect(splitByTripleNewline('a\n\nb')).toBeNull()
  })

  it('3연속 개행으로 쪼개고 trimming하며 빈 조각은 버린다', () => {
    expect(splitByTripleNewline('a\n\n\n b\n\n\n\n\n\n')).toEqual(['a', 'b'])
    expect(splitByTripleNewline('\n\n\n')).toEqual([])
  })
})
