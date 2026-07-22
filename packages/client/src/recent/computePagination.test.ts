import { describe, expect, it } from 'vitest'
import { computePagination } from './computePagination'

describe('computePagination', () => {
  it('처음 들어오면 1페이지만 노출하고 뒤쪽 줄임표를 남긴다', () => {
    expect(
      computePagination({ currentPage: 1, loadedPageCount: 1, isEndReached: false }),
    ).toEqual({
      pages: [1],
      hasLeadingEllipsis: false,
      hasTrailingEllipsis: true,
      canGoPrevious: false,
      canGoNext: true,
    })
  })

  it('1페이지가 곧 끝이면 양쪽 줄임표가 모두 없다', () => {
    expect(
      computePagination({ currentPage: 1, loadedPageCount: 1, isEndReached: true }),
    ).toEqual({
      pages: [1],
      hasLeadingEllipsis: false,
      hasTrailingEllipsis: false,
      canGoPrevious: false,
      canGoNext: false,
    })
  })

  it('탐사된 1~8에서 7페이지에 있으면 5~8을 노출한다', () => {
    expect(
      computePagination({ currentPage: 7, loadedPageCount: 8, isEndReached: false }),
    ).toEqual({
      pages: [5, 6, 7, 8],
      hasLeadingEllipsis: true,
      hasTrailingEllipsis: true,
      canGoPrevious: true,
      canGoNext: true,
    })
  })

  it('가운데에 있으면 위아래 2개씩 5개를 노출한다', () => {
    expect(
      computePagination({ currentPage: 5, loadedPageCount: 9, isEndReached: false }),
    ).toEqual({
      pages: [3, 4, 5, 6, 7],
      hasLeadingEllipsis: true,
      hasTrailingEllipsis: true,
      canGoPrevious: true,
      canGoNext: true,
    })
  })

  it('아래쪽 경계에서는 잘려서 5개보다 적게 노출한다', () => {
    expect(
      computePagination({ currentPage: 1, loadedPageCount: 8, isEndReached: true }),
    ).toEqual({
      pages: [1, 2, 3],
      hasLeadingEllipsis: false,
      hasTrailingEllipsis: true,
      canGoPrevious: false,
      canGoNext: true,
    })
  })

  it('끝에 닿은 마지막 페이지에서는 뒤쪽 줄임표와 다음이 사라진다', () => {
    expect(
      computePagination({ currentPage: 8, loadedPageCount: 8, isEndReached: true }),
    ).toEqual({
      pages: [6, 7, 8],
      hasLeadingEllipsis: true,
      hasTrailingEllipsis: false,
      canGoPrevious: true,
      canGoNext: false,
    })
  })

  it('끝에 닿지 않은 마지막 페이지에서는 다음이 살아있다', () => {
    expect(
      computePagination({ currentPage: 8, loadedPageCount: 8, isEndReached: false }),
    ).toEqual({
      pages: [6, 7, 8],
      hasLeadingEllipsis: true,
      hasTrailingEllipsis: true,
      canGoPrevious: true,
      canGoNext: true,
    })
  })

  it('창이 탐사된 구간 전체를 덮고 끝에도 닿았으면 줄임표가 없다', () => {
    expect(
      computePagination({ currentPage: 3, loadedPageCount: 5, isEndReached: true }),
    ).toEqual({
      pages: [1, 2, 3, 4, 5],
      hasLeadingEllipsis: false,
      hasTrailingEllipsis: false,
      canGoPrevious: true,
      canGoNext: true,
    })
  })

  it('창이 구간 전체를 덮어도 끝에 닿지 않았으면 뒤쪽 줄임표가 남는다', () => {
    expect(
      computePagination({ currentPage: 3, loadedPageCount: 5, isEndReached: false }),
    ).toEqual({
      pages: [1, 2, 3, 4, 5],
      hasLeadingEllipsis: false,
      hasTrailingEllipsis: true,
      canGoPrevious: true,
      canGoNext: true,
    })
  })
})
