import { describe, expect, it } from 'vitest'
import { computeMatrixNavigation } from './computeMatrixNavigation'
import { Matrix, createInput, createSelection } from './matrixNavigationFixture'

describe('computeMatrixNavigation 고정 헤더', () => {
  it('첫 편집 행에서 ArrowUp은 헤더 행으로 가지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowUp'),
        { row: 1, column: 0 },
        createSelection(0),
        Matrix,
        1,
      ),
    ).toBeNull()
  })

  it('첫 편집 행 첫 열의 시작 커서에서 ArrowLeft는 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowLeft'),
        { row: 1, column: 0 },
        createSelection(0),
        Matrix,
        1,
      ),
    ).toBeNull()
  })

  it('편집 행 사이의 이동은 그대로다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowDown'),
        { row: 1, column: 0 },
        createSelection(1),
        Matrix,
        1,
      ),
    ).toEqual({ row: 2, column: 0, caret: 1 })
  })
})
