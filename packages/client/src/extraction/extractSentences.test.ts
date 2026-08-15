import { describe, expect, it } from 'vitest'
import { extractSentences } from './extractSentences'

describe('extractSentences', () => {
  it('줄 단위로 자르고 trimming한다', () => {
    expect(extractSentences('첫 문장.\n  둘째 문장!\n셋째 문장?')).toEqual([
      '첫 문장.',
      '둘째 문장!',
      '셋째 문장?',
    ])
  })

  it('빈 줄과 공백만 있는 줄은 제거한다', () => {
    expect(extractSentences('a\n\n   \n\tb\n')).toEqual(['a', 'b'])
  })

  it('CRLF 줄바꿈도 다룬다', () => {
    expect(extractSentences('a\r\nb')).toEqual(['a', 'b'])
  })

  it('빈 문자열은 빈 배열이다', () => {
    expect(extractSentences('')).toEqual([])
  })
})
