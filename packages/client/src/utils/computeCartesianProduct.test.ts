import { describe, expect, it } from 'vitest'
import { computeCartesianProduct } from './computeCartesianProduct'

describe('computeCartesianProduct', () => {
  it('첫 목록이 바깥 루프가 되는 순서로 조합을 만든다', () => {
    expect(
      computeCartesianProduct([
        ['a', 'b'],
        ['0', '1'],
        ['ㄱ', 'ㄴ'],
      ]),
    ).toEqual([
      ['a', '0', 'ㄱ'],
      ['a', '0', 'ㄴ'],
      ['a', '1', 'ㄱ'],
      ['a', '1', 'ㄴ'],
      ['b', '0', 'ㄱ'],
      ['b', '0', 'ㄴ'],
      ['b', '1', 'ㄱ'],
      ['b', '1', 'ㄴ'],
    ])
  })

  it('빈 목록이 하나라도 있으면 조합이 없다', () => {
    expect(computeCartesianProduct([['a'], [], ['ㄱ']])).toEqual([])
  })
})
