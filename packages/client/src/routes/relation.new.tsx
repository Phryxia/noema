import { createFileRoute } from '@tanstack/react-router'
import { RelationPage } from '../relation/RelationPage/RelationPage'

export const Route = createFileRoute('/relation/new')({
  component: RelationPage,
})
