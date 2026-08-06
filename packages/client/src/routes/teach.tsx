import { createFileRoute } from '@tanstack/react-router'
import { TeachPage } from '../teach/TeachPage/TeachPage'

export const Route = createFileRoute('/teach')({
  component: TeachPage,
})
