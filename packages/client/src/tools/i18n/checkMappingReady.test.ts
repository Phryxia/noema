import { describe, expect, it } from 'vitest'
import { checkMappingReady } from './checkMappingReady'

describe('checkMappingReady', () => {
  it('만들 관계가 있으면 제출할 수 있다', () => {
    expect(
      checkMappingReady([
        ['한국어', '영어'],
        ['사과', 'apple'],
      ]),
    ).toBe(true)
  })

  it('데이터가 있는 열의 언어 이름이 비면 제출할 수 없다', () => {
    expect(
      checkMappingReady([
        ['한국어', ''],
        ['사과', 'apple'],
      ]),
    ).toBe(false)
  })

  it('데이터가 없는 열의 언어 이름은 비어 있어도 된다', () => {
    expect(
      checkMappingReady([
        ['한국어', '영어', ''],
        ['사과', 'apple', ''],
      ]),
    ).toBe(true)
  })

  it('만들 관계가 없으면 제출할 수 없다', () => {
    expect(
      checkMappingReady([
        ['한국어', '영어'],
        ['사과', ''],
      ]),
    ).toBe(false)
  })
})
