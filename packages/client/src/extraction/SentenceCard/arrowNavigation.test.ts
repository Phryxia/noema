import type { KeyboardEvent } from 'react'
import { describe, expect, it } from 'vitest'
import { computeArrowNavigation } from './arrowNavigation'
import type { CaretLine } from './caretGeometry'

interface FakeEventOptions {
  key: string
  value: string
  caret: number
  selectionEnd?: number
  shiftKey?: boolean
}

function createEvent({
  key,
  value,
  caret,
  selectionEnd = caret,
  shiftKey = false,
}: FakeEventOptions): KeyboardEvent<HTMLTextAreaElement> {
  return {
    key,
    shiftKey,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    currentTarget: { value, selectionStart: caret, selectionEnd },
  } as unknown as KeyboardEvent<HTMLTextAreaElement>
}

function createMeasure(line: CaretLine): () => CaretLine {
  return () => line
}

const MIDDLE_LINE: CaretLine = { isFirstLine: false, isLastLine: false, x: 12 }

describe('computeArrowNavigation', () => {
  it('끝에서 ArrowRight는 다음 카드 맨 앞', () => {
    expect(
      computeArrowNavigation(createEvent({ key: 'ArrowRight', value: 'ab', caret: 2 })),
    ).toEqual({ direction: 'next', x: null })
    expect(
      computeArrowNavigation(createEvent({ key: 'ArrowRight', value: 'ab', caret: 1 })),
    ).toBeNull()
  })

  it('처음에서 ArrowLeft는 이전 카드 맨 끝', () => {
    expect(
      computeArrowNavigation(createEvent({ key: 'ArrowLeft', value: 'ab', caret: 0 })),
    ).toEqual({ direction: 'previous', x: null })
    expect(
      computeArrowNavigation(createEvent({ key: 'ArrowLeft', value: 'ab', caret: 1 })),
    ).toBeNull()
  })

  it('마지막 시각 행에서 ArrowDown은 캐럿 x를 들고 다음 카드로', () => {
    const measure = createMeasure({ isFirstLine: false, isLastLine: true, x: 30 })
    expect(
      computeArrowNavigation(createEvent({ key: 'ArrowDown', value: 'ab', caret: 1 }), measure),
    ).toEqual({ direction: 'next', x: 30 })
    expect(
      computeArrowNavigation(
        createEvent({ key: 'ArrowDown', value: 'ab', caret: 1 }),
        createMeasure(MIDDLE_LINE),
      ),
    ).toBeNull()
  })

  it('첫 시각 행에서 ArrowUp은 캐럿 x를 들고 이전 카드로', () => {
    const measure = createMeasure({ isFirstLine: true, isLastLine: false, x: 7 })
    expect(
      computeArrowNavigation(createEvent({ key: 'ArrowUp', value: 'ab', caret: 1 }), measure),
    ).toEqual({ direction: 'previous', x: 7 })
    expect(
      computeArrowNavigation(
        createEvent({ key: 'ArrowUp', value: 'ab', caret: 1 }),
        createMeasure(MIDDLE_LINE),
      ),
    ).toBeNull()
  })

  it('화살표가 아니거나 선택 영역·수정키가 있으면 무시', () => {
    expect(
      computeArrowNavigation(createEvent({ key: 'Enter', value: 'ab', caret: 2 })),
    ).toBeNull()
    expect(
      computeArrowNavigation(
        createEvent({ key: 'ArrowRight', value: 'ab', caret: 2, selectionEnd: 1 }),
      ),
    ).toBeNull()
    expect(
      computeArrowNavigation(
        createEvent({ key: 'ArrowRight', value: 'ab', caret: 2, shiftKey: true }),
      ),
    ).toBeNull()
  })
})
