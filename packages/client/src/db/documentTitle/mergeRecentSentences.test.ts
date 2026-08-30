import { describe, expect, it } from 'vitest'
import { mergeRecentSentences, readQueueOrder, toDateSortKey } from './mergeRecentSentences'

function sentence(
  sentenceId: number,
  time: number,
): {
  sentenceId: number
  value: string
  createdAt: Date
} {
  return { sentenceId, value: `s${sentenceId}`, createdAt: new Date(time) }
}

describe('mergeRecentSentences', () => {
  it('추가분을 기존보다 새것으로 뒤에 붙이고 최신 4개를 남긴다', () => {
    const { slots, next } = mergeRecentSentences(
      [sentence(1, 10), sentence(2, 50)],
      [sentence(7, 30), sentence(8, 20), sentence(9, 5)],
      toDateSortKey,
    )
    expect(slots.map((slot) => slot?.sentenceId)).toEqual([2, 9, 8, 7])
    expect(next).toBe(0)
  })

  it('4개 미만이면 앞에서 채우고 나머지는 null, next는 개수다', () => {
    const { slots, next } = mergeRecentSentences(
      [sentence(1, 10)],
      [sentence(2, 5)],
      toDateSortKey,
    )
    expect(slots.map((slot) => slot?.sentenceId ?? null)).toEqual([1, 2, null, null])
    expect(next).toBe(2)
  })

  it('이미 큐에 있는 추가분은 기존 자리에서 빼고 추가분 자리에 둔다', () => {
    const { slots } = mergeRecentSentences(
      [sentence(3, 10), sentence(1, 20)],
      [sentence(3, 10), sentence(2, 10)],
      toDateSortKey,
    )
    expect(slots.map((slot) => slot?.sentenceId ?? null)).toEqual([1, 2, 3, null])
  })
})

describe('readQueueOrder', () => {
  it('next부터 돌며 오래된 순으로 읽고 빈 칸은 건너뛴다', () => {
    expect(readQueueOrder(['c', null, 'a', 'b'], 2)).toEqual(['a', 'b', 'c'])
  })
})
