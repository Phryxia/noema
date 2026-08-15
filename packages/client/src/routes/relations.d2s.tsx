import { createFileRoute } from '@tanstack/react-router'
import { D2sPage } from '../d2s/D2sPage'

export const Route = createFileRoute('/relations/d2s')({
  component: D2sPage,
})
