import { Fragment } from 'react'
import type { ReactElement } from 'react'

interface HighlightedTextProps {
  text: string
  keyword?: string
}

export function HighlightedText({ text, keyword }: HighlightedTextProps): ReactElement {
  if (!keyword || !text.includes(keyword)) {
    return <>{text}</>
  }
  const pieces = text.split(keyword)
  return (
    <>
      {pieces.map((piece, index) => (
        <Fragment key={index}>
          {index > 0 && <mark>{keyword}</mark>}
          {piece}
        </Fragment>
      ))}
    </>
  )
}
