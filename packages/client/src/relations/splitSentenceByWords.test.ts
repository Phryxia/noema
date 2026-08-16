import { describe, expect, it } from 'vitest'
import { splitSentenceByWords } from './splitSentenceByWords'
import type { ResolvedRefToken } from './types'

function word(id: number, value: string): ResolvedRefToken {
  return { kind: 'word', id, value }
}

function text(value: string): { kind: 'text'; value: string } {
  return { kind: 'text', value }
}

describe('splitSentenceByWords', () => {
  it('문장 안의 단어를 모두 링크 조각으로 가른다', () => {
    const words = [word(1, '매타작'), word(2, '각오'), word(3, '개수')]
    expect(splitSentenceByWords('틀린 개수만큼 매타작이니까 각오해라.', words)).toEqual([
      text('틀린 '),
      word(3, '개수'),
      text('만큼 '),
      word(1, '매타작'),
      text('이니까 '),
      word(2, '각오'),
      text('해라.'),
    ])
  })

  it('같은 단어가 여러 번 나오면 모두 링크한다', () => {
    expect(splitSentenceByWords('산 너머 산', [word(1, '산')])).toEqual([
      word(1, '산'),
      text(' 너머 '),
      word(1, '산'),
    ])
  })

  it('같은 위치에서 겹치면 긴 단어를 고르고, 앞선 위치가 우선한다', () => {
    const words = [word(1, '사과'), word(2, '사과나무'), word(3, '나무')]
    expect(splitSentenceByWords('사과나무 아래 나무', words)).toEqual([
      word(2, '사과나무'),
      text(' 아래 '),
      word(3, '나무'),
    ])
  })

  it('삭제된 단어는 건너뛰고, 일치가 없으면 문장 전체가 한 조각이다', () => {
    expect(splitSentenceByWords('아무 말', [word(1, ''), word(2, '없음')])).toEqual([
      text('아무 말'),
    ])
  })
})
