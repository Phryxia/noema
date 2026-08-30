import { describe, expect, it } from 'vitest'
import { createDefaultTitle } from './createDefaultTitle'

describe('createDefaultTitle', () => {
  it('공백문자를 모두 빼고 앞 10글자를 쓴다', () => {
    expect(createDefaultTitle(' 가 나\t다\r\n라　마바사아자차카타', 1)).toBe(
      '가나다라마바사아자차',
    )
  })

  it('10글자 미만이면 있는 만큼 쓴다', () => {
    expect(createDefaultTitle('짧은 글', 1)).toBe('짧은글')
  })

  it('서로게이트 쌍을 한 글자로 센다', () => {
    const emoji = '😀'.repeat(12)
    expect(createDefaultTitle(emoji, 1)).toBe('😀'.repeat(10))
  })

  it('공백뿐이면 문서 번호로 채운다', () => {
    expect(createDefaultTitle(' \n\t ', 7)).toBe('문서 7')
  })
})
