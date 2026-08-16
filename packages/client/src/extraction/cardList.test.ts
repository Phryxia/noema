import { describe, expect, it } from 'vitest'
import {
  createCardList,
  listCards,
  mergeWithPrevious,
  removeCard,
  splitCard,
  updateCardValue,
} from './cardList'

function values(list: ReturnType<typeof createCardList>): string[] {
  return listCards(list).map((card) => card.value)
}

describe('cardList', () => {
  it('값 목록으로 만들고 순서대로 나열한다', () => {
    const list = createCardList(['a', 'b', 'c'])
    expect(values(list)).toEqual(['a', 'b', 'c'])
    expect(createCardList([]).headId).toBeNull()
  })

  it('값을 갱신해도 다른 카드는 그대로다', () => {
    const list = updateCardValue(createCardList(['a', 'b']), 1, 'B')
    expect(values(list)).toEqual(['a', 'B'])
  })

  it('앞 카드와 구분자 없이 병합한다', () => {
    const list = mergeWithPrevious(createCardList(['a', 'b', 'c']), 1)
    expect(values(list)).toEqual(['ab', 'c'])
    expect(listCards(list).map((card) => card.id)).toEqual([0, 2])
  })

  it('첫 카드는 병합할 앞 카드가 없어 그대로다', () => {
    const list = createCardList(['a', 'b'])
    expect(mergeWithPrevious(list, 0)).toBe(list)
  })

  it('조각으로 쪼개면 새 카드가 뒤에 끼어든다', () => {
    const { list, insertedIds } = splitCard(createCardList(['a', 'z']), 0, ['a1', 'a2', 'a3'])
    expect(values(list)).toEqual(['a1', 'a2', 'a3', 'z'])
    expect(insertedIds).toEqual([2, 3])
    expect(list.nextId).toBe(4)
  })

  it('조각이 하나면 값만 바뀐다', () => {
    const { list, insertedIds } = splitCard(createCardList(['a', 'z']), 0, ['A'])
    expect(values(list)).toEqual(['A', 'z'])
    expect(insertedIds).toEqual([])
  })

  it('조각이 없으면 빈 값이 된다', () => {
    const { list } = splitCard(createCardList(['a']), 0, [])
    expect(values(list)).toEqual([''])
  })

  it('카드를 지우면 앞뒤가 이어지고 머리도 갱신된다', () => {
    const list = createCardList(['a', 'b', 'c'])
    expect(values(removeCard(list, 1))).toEqual(['a', 'c'])
    expect(values(removeCard(list, 0))).toEqual(['b', 'c'])
    expect(removeCard(createCardList(['a']), 0).headId).toBeNull()
  })
})
