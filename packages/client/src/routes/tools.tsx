import { createFileRoute } from '@tanstack/react-router'
import { ToolsPage } from '../tools/ToolsPage'
import type { ToolsTab } from '../tools/toolsTab'
import { resolveToolsTab } from '../tools/toolsTab'

interface ToolsSearchParams {
  tab?: ToolsTab
}

export const Route = createFileRoute('/tools')({
  component: ToolsPage,
  validateSearch: (search: Record<string, unknown>): ToolsSearchParams => {
    const tab = resolveToolsTab(search.tab)
    if (tab === 'order') {
      return {}
    }
    return { tab }
  },
})
