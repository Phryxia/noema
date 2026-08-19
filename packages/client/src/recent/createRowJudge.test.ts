import { describe, expect, it } from 'vitest'
import { createRowJudge } from './createRowJudge'
import { RECENT_PAGE_SIZE } from './consts'

const Even = (row: number): boolean => !(row % 2)

describe('createRowJudge', () => {
  it('필터가 없으면 offset을 건너뛰지 않는다', () => {
    const judge = createRowJudge<number>({ kind: 'offset', offset: 5 })
    expect(judge(1, 0)).toBe('collect')
  })

  it('필터가 있으면 통과 행 offset개만 건너뛴다', () => {
    const judge = createRowJudge({ kind: 'offset', offset: 2 }, Even)
    expect(judge(2, 0)).toBe('skip')
    expect(judge(4, 0)).toBe('skip')
    expect(judge(6, 0)).toBe('collect')
  })

  it('통과하지 못한 행은 offset을 소모하지 않는다', () => {
    const judge = createRowJudge({ kind: 'offset', offset: 1 }, Even)
    expect(judge(1, 0)).toBe('skip')
    expect(judge(3, 0)).toBe('skip')
    expect(judge(2, 0)).toBe('skip')
    expect(judge(4, 0)).toBe('collect')
  })

  it('커서 시작은 필터가 있어도 건너뛰지 않는다', () => {
    const judge = createRowJudge(
      { kind: 'cursor', cursor: { createdAt: new Date(0), id: 1 } },
      Even,
    )
    expect(judge(2, 0)).toBe('collect')
  })

  it('한 페이지를 채운 뒤의 통과 행에서 멈춘다', () => {
    const judge = createRowJudge({ kind: 'offset', offset: 0 }, Even)
    expect(judge(1, RECENT_PAGE_SIZE)).toBe('skip')
    expect(judge(2, RECENT_PAGE_SIZE)).toBe('stop')
  })
})
