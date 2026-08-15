import { describe, expect, it } from 'vitest'
import { computeAdjacentPairs } from './computeAdjacentPairs'

describe('computeAdjacentPairs', () => {
  it('인접한 두 원소를 순서대로 짝짓는다', () => {
    expect(computeAdjacentPairs(['a', 'b', 'c'])).toEqual([
      ['a', 'b'],
      ['b', 'c'],
    ])
  })

  it('원소가 1개 이하면 짝이 없다', () => {
    expect(computeAdjacentPairs(['a'])).toEqual([])
    expect(computeAdjacentPairs([])).toEqual([])
  })
})
