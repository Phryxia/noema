import { describe, expect, it } from 'vitest'
import { extractWords } from './extractWords'

describe('extractWords', () => {
  it('공백은 별개의 단어가 된다', () => {
    expect(extractWords('Bad Ass')).toEqual(['Bad', ' ', 'Ass'])
  })

  it('라틴 확장 문자는 영문과 같은 클래스다', () => {
    expect(extractWords('Caffè-tic')).toEqual(['Caffè', '-', 'tic'])
  })

  it('한자에서 히라가나로는 자르지 않고 히라가나에서 한자로는 자른다', () => {
    expect(extractWords('話す事言うべき')).toEqual(['話す', '事言うべき'])
  })

  it('기호와 한글이 섞이면 클래스마다 자른다', () => {
    expect(extractWords("'''너는''' \t왜 그렇게")).toEqual([
      "'''",
      '너는',
      "'''",
      '  ',
      '왜',
      ' ',
      '그렇게',
    ])
  })

  it('마크다운 문법을 기호 덩어리로 자른다', () => {
    expect(extractWords('[*이상한* 마크다운](foo)')).toEqual([
      '[*',
      '이상한',
      '*',
      ' ',
      '마크다운',
      '](',
      'foo',
      ')',
    ])
  })

  it('전각과 반각은 내용이 같아도 다른 클래스다', () => {
    expect(extractWords('０0')).toEqual(['０', '0'])
    expect(extractWords('ａa')).toEqual(['ａ', 'a'])
  })

  it('기호끼리는 종류가 달라도 붙는다', () => {
    expect(extractWords('─┴┳')).toEqual(['─┴┳'])
  })

  it('々는 앞 문자와 같은 단어가 된다', () => {
    expect(extractWords('人々')).toEqual(['人々'])
    expect(extractWords('人々の')).toEqual(['人々の'])
  })

  it('장음표기는 카타카나로 본다', () => {
    expect(extractWords('ラーメン')).toEqual(['ラーメン'])
    expect(extractWords('らーめん')).toEqual(['ら', 'ー', 'めん'])
  })

  it('숫자는 자바스크립트가 인식하는 형식대로 한 덩어리가 된다', () => {
    expect(extractWords('a3c')).toEqual(['a', '3', 'c'])
    expect(extractWords('+3.1e-4')).toEqual(['+', '3.1e-4'])
    expect(extractWords('0xF9')).toEqual(['0xF9'])
    expect(extractWords('3.14')).toEqual(['3.14'])
  })

  it('소수점 뒤에 숫자가 없으면 숫자에 넣지 않는다', () => {
    expect(extractWords('값은 3.')).toEqual(['값은', ' ', '3', '.'])
  })

  it('개행은 삭제하고 탭은 공백 하나로 바꾼다', () => {
    expect(extractWords('가\n나')).toEqual(['가나'])
    expect(extractWords('가\r\n나')).toEqual(['가나'])
    expect(extractWords('a\t\tb')).toEqual(['a', ' ', 'b'])
  })

  it('빈 문자열은 빈 배열이다', () => {
    expect(extractWords('')).toEqual([])
  })
})
