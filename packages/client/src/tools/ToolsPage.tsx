import type { ReactElement } from 'react'
import { OrderingTool } from './ordering/OrderingTool'

export function ToolsPage(): ReactElement {
  return (
    <article>
      <h2>도구</h2>
      <OrderingTool />
    </article>
  )
}
