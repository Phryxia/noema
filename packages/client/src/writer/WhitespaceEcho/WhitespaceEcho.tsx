import type { ReactElement } from 'react'
import classnames from 'classnames/bind'
import styles from './WhitespaceEcho.module.css'

const cx = classnames.bind(styles)

const WHITESPACE_PATTERN = /([ \t])/

interface WhitespaceEchoProps {
  value: string
  isMultiline: boolean
  scrollLeft: number
  scrollTop: number
}

export function WhitespaceEcho({
  value,
  isMultiline,
  scrollLeft,
  scrollTop,
}: WhitespaceEchoProps): ReactElement {
  return (
    <div className={cx('echo', { multiline: isMultiline })}>
      <span style={{ transform: `translate(${-scrollLeft}px, ${-scrollTop}px)` }}>
        {value.split(WHITESPACE_PATTERN).map((token, index) => (
          <span key={index} className={cx(getTokenClassName(token))}>
            {token}
          </span>
        ))}
      </span>
    </div>
  )
}

function getTokenClassName(token: string): string {
  if (token === ' ') {
    return 'space'
  }
  if (token === '\t') {
    return 'tab'
  }
  return 'hidden'
}
