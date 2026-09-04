import { createFileRoute } from '@tanstack/react-router'
import { DiaryPage } from '../diary/DiaryPage'

export const Route = createFileRoute('/diary')({
  component: DiaryPage,
})
