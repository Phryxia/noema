import type { ReactElement } from 'react'
import { DocumentWriter } from '../document/DocumentWriter/DocumentWriter'
import { MarkdownPreview } from '../shared/MarkdownPreview'

export function DiaryPage(): ReactElement {
  return (
    <article>
      <DocumentWriter isEditable renderPreview={(value) => <MarkdownPreview value={value} />} />
    </article>
  )
}
