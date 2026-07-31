import { describe, expect, it } from 'vitest'
import { computeDims } from './computeDims'

describe('computeDims', () => {
  it('범위가 잘못되면 null을 돌려준다', () => {
    expect(computeDims({ dMin: 0, dMax: 32, dResolution: 4 })).toBeNull()
    expect(computeDims({ dMin: 8, dMax: 4, dResolution: 2 })).toBeNull()
    expect(computeDims({ dMin: 2, dMax: 32, dResolution: 0 })).toBeNull()
    expect(computeDims({ dMin: 2.5, dMax: 32, dResolution: 4 })).toBeNull()
    expect(computeDims({ dMin: 2, dMax: 32, dResolution: NaN })).toBeNull()
  })

  it('dResolution은 dMax - dMin + 1 미만이어야 한다', () => {
    expect(computeDims({ dMin: 2, dMax: 5, dResolution: 4 })).toBeNull()
    expect(computeDims({ dMin: 2, dMax: 5, dResolution: 3 })).toEqual([2, 4, 5])
  })

  it('dResolution이 1이면 dMin 하나만 시험한다', () => {
    expect(computeDims({ dMin: 3, dMax: 10, dResolution: 1 })).toEqual([3])
  })

  it('범위를 균등 간격 정수로 나눈다', () => {
    expect(computeDims({ dMin: 2, dMax: 32, dResolution: 4 })).toEqual([2, 12, 22, 32])
  })

  it('반올림으로 겹친 차원은 중복 제거한다', () => {
    expect(computeDims({ dMin: 2, dMax: 4, dResolution: 2 })).toEqual([2, 4])
  })
})
