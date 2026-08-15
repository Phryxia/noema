import { describe, expect, it } from 'vitest'
import { parseBatchLines } from './parseBatchLines'

describe('parseBatchLines', () => {
  it('빈 줄은 버리고 공백만 있는 줄은 살린다', () => {
    expect(parseBatchLines('a\n\n \n\t\nb')).toEqual(['a', ' ', '\t', 'b'])
  })

  it('CRLF를 줄바꿈으로 본다', () => {
    expect(parseBatchLines('a\r\nb\r\n')).toEqual(['a', 'b'])
  })

  it('같은 줄은 첫 등장 순으로 한 번만 남긴다', () => {
    expect(parseBatchLines('b\na\nb\na ')).toEqual(['b', 'a', 'a '])
  })
})
