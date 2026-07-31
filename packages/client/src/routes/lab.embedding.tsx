import { createFileRoute } from '@tanstack/react-router'
import { LabEmbeddingPage } from '../lab/embedding/LabEmbeddingPage/LabEmbeddingPage'

export const Route = createFileRoute('/lab/embedding')({
  component: LabEmbeddingPage,
})
