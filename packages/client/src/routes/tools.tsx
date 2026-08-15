import { createFileRoute } from '@tanstack/react-router'
import { ToolsPage } from '../tools/ToolsPage'

export const Route = createFileRoute('/tools')({ component: ToolsPage })
