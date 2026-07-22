import type { FormEvent, ReactElement } from 'react'
import { useState } from 'react'
import classnames from 'classnames/bind'
import type { RecentRange } from '../types'
import { formatDateTimeLocal, parseDateTimeLocal, toInclusiveMinuteEnd } from '../utils'
import styles from './RangeSearchForm.module.css'

const cx = classnames.bind(styles)

interface RangeSearchFormProps {
  range: RecentRange
  onSearch: (range: RecentRange) => void
}

export function RangeSearchForm({ range, onSearch }: RangeSearchFormProps): ReactElement {
  const [since, setSince] = useState(range.since ? formatDateTimeLocal(range.since) : '')
  const [until, setUntil] = useState(formatDateTimeLocal(range.until))

  const sinceDate = parseDateTimeLocal(since)
  const untilDate = parseDateTimeLocal(until)
  const isReversed = !!sinceDate && !!untilDate && sinceDate.getTime() > untilDate.getTime()
  const isSearchable = !!untilDate && !isReversed

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!untilDate || isReversed) {
      return
    }
    onSearch({ since: sinceDate, until: toInclusiveMinuteEnd(untilDate) })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={cx('fields')}>
        <label>
          시작
          <input
            type="datetime-local"
            value={since}
            onChange={(event) => setSince(event.target.value)}
          />
        </label>
        <label>
          종료
          <input
            type="datetime-local"
            value={until}
            onChange={(event) => setUntil(event.target.value)}
          />
        </label>
        <button type="submit" disabled={!isSearchable}>
          검색
        </button>
      </div>
      {isReversed && <small>시작 날짜가 종료 날짜보다 뒤입니다</small>}
    </form>
  )
}
