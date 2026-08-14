import { createFileRoute } from '@tanstack/react-router'
import { QnaPage } from '../qna/QnaPage'

export const Route = createFileRoute('/qna')({
  component: QnaPage,
})
