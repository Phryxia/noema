import { describe, expect, it } from 'vitest'
import { splitByTripleNewline } from './splitByTripleNewline'

describe('splitByTripleNewline', () => {
  it('3연속 개행이 없으면 쪼개지 않는다', () => {
    expect(splitByTripleNewline('a\n\nb')).toBeNull()
  })

  it('3연속 개행으로 쪼개고 trimming하며 빈 조각은 버린다', () => {
    expect(splitByTripleNewline('a\n\n\n b\n\n\n\n\n\n')).toEqual(['a', 'b'])
    expect(splitByTripleNewline('\n\n\n')).toEqual([])
  })
})
