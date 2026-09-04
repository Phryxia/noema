import type { ReactElement } from 'react'
import MarkdownIt from 'markdown-it'
import { katex } from '@mdit/plugin-katex'
import 'katex/dist/katex.min.css'

const MarkdownParser = new MarkdownIt({ html: true }).use(katex)

interface MarkdownPreviewProps {
  value: string
}

export function MarkdownPreview({ value }: MarkdownPreviewProps): ReactElement {
  return <div dangerouslySetInnerHTML={{ __html: MarkdownParser.render(value) }} />
}
