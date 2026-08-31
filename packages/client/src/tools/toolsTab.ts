export type ToolsTab = 'order' | 'i18n' | 'jp'

const ToolsTabs: ToolsTab[] = ['order', 'i18n', 'jp']

export function resolveToolsTab(value: unknown): ToolsTab {
  const tab = ToolsTabs.find((candidate) => candidate === value)
  if (!tab) {
    return 'order'
  }
  return tab
}
