import { describe, expect, it } from 'vitest'
import { computeMappingTuples } from './computeMappingTuples'

describe('computeMappingTuples', () => {
  it('같은 행의 두 단어를 상대 언어 이름으로 양방향 연결한다', () => {
    expect(
      computeMappingTuples([
        ['한국어', '영어'],
        ['사과', 'apple'],
      ]),
    ).toEqual([
      ['사과', 'apple', '영어'],
      ['apple', '사과', '한국어'],
    ])
  })

  it('빈 칸은 건너뛴다', () => {
    expect(
      computeMappingTuples([
        ['한국어', '영어', '일본어'],
        ['사과', '', 'りんご'],
      ]),
    ).toEqual([
      ['사과', 'りんご', '일본어'],
      ['りんご', '사과', '한국어'],
    ])
  })

  it('언어 이름이 빈 열로 향하는 관계는 만들지 않는다', () => {
    expect(
      computeMappingTuples([
        ['한국어', ''],
        ['사과', 'apple'],
      ]),
    ).toEqual([['apple', '사과', '한국어']])
  })

  it('여러 행의 같은 튜플은 한 번만 만든다', () => {
    expect(
      computeMappingTuples([
        ['한국어', '영어'],
        ['사과', 'apple'],
        ['사과', 'apple'],
      ]),
    ).toEqual([
      ['사과', 'apple', '영어'],
      ['apple', '사과', '한국어'],
    ])
  })

  it('헤더 행만 있으면 아무것도 만들지 않는다', () => {
    expect(computeMappingTuples([['한국어', '영어']])).toEqual([])
  })
})
