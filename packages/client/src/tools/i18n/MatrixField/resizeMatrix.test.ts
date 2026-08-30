import { describe, expect, it } from 'vitest'
import { addColumn, addRow, removeColumnAt, removeRowAt } from './resizeMatrix'

describe('resizeMatrix', () => {
  it('행을 끝에 빈 칸으로 추가한다', () => {
    expect(addRow([['a', 'b']])).toEqual([
      ['a', 'b'],
      ['', ''],
    ])
  })

  it('열을 모든 행 끝에 빈 칸으로 추가한다', () => {
    expect(
      addColumn([
        ['a', 'b'],
        ['c', 'd'],
      ]),
    ).toEqual([
      ['a', 'b', ''],
      ['c', 'd', ''],
    ])
  })

  it('지정한 행을 삭제한다', () => {
    expect(
      removeRowAt(
        [
          ['a', 'b'],
          ['c', 'd'],
        ],
        0,
      ),
    ).toEqual([['c', 'd']])
  })

  it('행이 하나뿐이면 삭제하지 않는다', () => {
    const matrix = [['a', 'b']]
    expect(removeRowAt(matrix, 0)).toBe(matrix)
  })

  it('지정한 열을 삭제한다', () => {
    expect(
      removeColumnAt(
        [
          ['a', 'b'],
          ['c', 'd'],
        ],
        1,
      ),
    ).toEqual([['a'], ['c']])
  })

  it('열이 하나뿐이면 삭제하지 않는다', () => {
    const matrix = [['a'], ['b']]
    expect(removeColumnAt(matrix, 0)).toBe(matrix)
  })
})
