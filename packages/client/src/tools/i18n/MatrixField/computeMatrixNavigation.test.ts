import { describe, expect, it } from 'vitest'
import { computeMatrixNavigation } from './computeMatrixNavigation'
import { Matrix, createInput, createSelection } from './matrixNavigationFixture'

describe('computeMatrixNavigation', () => {
  it('끝 커서에서 ArrowRight는 다음 열의 처음으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowRight'),
        { row: 1, column: 0 },
        createSelection(2),
        Matrix,
      ),
    ).toEqual({ row: 1, column: 1, caret: 0 })
  })

  it('중간 커서에서 ArrowRight는 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowRight'),
        { row: 1, column: 0 },
        createSelection(1),
        Matrix,
      ),
    ).toBeNull()
  })

  it('마지막 열의 끝 커서에서 ArrowRight는 다음 행 첫 열의 처음으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowRight'),
        { row: 1, column: 1 },
        createSelection(5),
        Matrix,
      ),
    ).toEqual({ row: 2, column: 0, caret: 0 })
  })

  it('마지막 칸의 끝 커서에서 ArrowRight는 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowRight'),
        { row: 2, column: 1 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })

  it('시작 커서에서 ArrowLeft는 이전 열의 마지막으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowLeft'),
        { row: 1, column: 1 },
        createSelection(0),
        Matrix,
      ),
    ).toEqual({ row: 1, column: 0, caret: 2 })
  })

  it('첫 열의 시작 커서에서 ArrowLeft는 이전 행 마지막 열의 마지막으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowLeft'),
        { row: 1, column: 0 },
        createSelection(0),
        Matrix,
      ),
    ).toEqual({ row: 0, column: 1, caret: 2 })
  })

  it('첫 칸의 시작 커서에서 ArrowLeft는 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowLeft'),
        { row: 0, column: 0 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })

  it('ArrowDown은 다음 행 같은 열의 같은 문자수로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowDown'),
        { row: 0, column: 0 },
        createSelection(1),
        Matrix,
      ),
    ).toEqual({ row: 1, column: 0, caret: 1 })
  })

  it('문자수가 부족하면 대상 칸의 끝으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowDown'),
        { row: 1, column: 1 },
        createSelection(4),
        Matrix,
      ),
    ).toEqual({ row: 2, column: 1, caret: 0 })
  })

  it('첫 행에서 ArrowUp은 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowUp'),
        { row: 0, column: 1 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })

  it('마지막 행에서 ArrowDown은 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowDown'),
        { row: 2, column: 0 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })

  it('선택 영역이 있으면 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('ArrowRight'),
        { row: 1, column: 0 },
        { selectionStart: 0, selectionEnd: 2 },
        Matrix,
      ),
    ).toBeNull()
  })

  it('Tab은 커서 위치와 무관하게 다음 칸의 처음으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('Tab'),
        { row: 0, column: 0 },
        createSelection(1),
        Matrix,
      ),
    ).toEqual({ row: 0, column: 1, caret: 0 })
  })

  it('Shift+Tab은 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('Tab', { shiftKey: true }),
        { row: 1, column: 1 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })

  it('마지막 칸에서 Tab은 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('Tab'),
        { row: 2, column: 1 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })

  it('Enter는 ArrowDown과 같은 곳으로 간다', () => {
    expect(
      computeMatrixNavigation(
        createInput('Enter'),
        { row: 0, column: 1 },
        createSelection(2),
        Matrix,
      ),
    ).toEqual({ row: 1, column: 1, caret: 2 })
  })

  it('마지막 행에서 Enter는 이동하지 않는다', () => {
    expect(
      computeMatrixNavigation(
        createInput('Enter'),
        { row: 2, column: 1 },
        createSelection(0),
        Matrix,
      ),
    ).toBeNull()
  })
})
