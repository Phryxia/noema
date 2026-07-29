import { createFileRoute } from '@tanstack/react-router'
import { ExplorePage } from '../explore/ExplorePage/ExplorePage'

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
})
