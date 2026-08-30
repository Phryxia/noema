import type { ReactElement } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import type { ToolsTab } from '../routes/tools'
import { OrderingTool } from './ordering/OrderingTool'
import { I18nMappingTool } from './i18n/I18nMappingTool'
import type { Choice } from '../explore/ChoiceGroup/ChoiceGroup'
import { ChoiceGroup } from '../explore/ChoiceGroup/ChoiceGroup'

const routeApi = getRouteApi('/tools')

const TabChoices: Choice<ToolsTab>[] = [
  { label: '순서화', value: 'order' },
  { label: '다국어 매핑', value: 'i18n' },
]

export function ToolsPage(): ReactElement {
  const { tab } = routeApi.useSearch()
  const navigate = routeApi.useNavigate()
  const selectedTab: ToolsTab = tab === 'i18n' ? 'i18n' : 'order'

  function selectTab(value: ToolsTab): void {
    navigate({
      search: (previous) => ({
        ...previous,
        tab: value === 'order' ? undefined : value,
      }),
    })
  }

  return (
    <article>
      <h2>도구</h2>
      <ChoiceGroup choices={TabChoices} selected={selectedTab} onSelect={selectTab} />
      {selectedTab === 'order' ? <OrderingTool /> : <I18nMappingTool />}
    </article>
  )
}
