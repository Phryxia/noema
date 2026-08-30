import { createFileRoute } from '@tanstack/react-router'
import { ToolsPage } from '../tools/ToolsPage'

export type ToolsTab = 'order' | 'i18n'

interface ToolsSearchParams {
  tab?: ToolsTab
}

export const Route = createFileRoute('/tools')({
  component: ToolsPage,
  validateSearch: (search: Record<string, unknown>): ToolsSearchParams => {
    if (search.tab === 'i18n') {
      return { tab: 'i18n' }
    }
    return {}
  },
})
