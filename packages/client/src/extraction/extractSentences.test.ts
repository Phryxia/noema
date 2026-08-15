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

  it('개행이 없어도 문장 부호 뒤에서 자른다', () => {
    expect(extractSentences('첫 문장. 둘째 문장!  셋째 문장? 넷째 "문장" 다섯째')).toEqual([
      '첫 문장.',
      '둘째 문장!',
      '셋째 문장?',
      '넷째 "문장"',
      '다섯째',
    ])
  })

  it('문장 부호 뒤에 공백이 없으면 자르지 않는다', () => {
    expect(extractSentences('CLAUDE.md와 3.14는 그대로. 끝.')).toEqual([
      'CLAUDE.md와 3.14는 그대로.',
      '끝.',
    ])
  })

  it('연속된 문장 부호는 한 문장에 붙인다', () => {
    expect(extractSentences('정말?! "그렇다." 응')).toEqual(['정말?!', '"그렇다."', '응'])
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
