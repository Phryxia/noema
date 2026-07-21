import type { ReactElement } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SENTENCE_QUERY_KEY } from '../sentence/consts'
import { getSentence } from '../sentence/sentence.service'
import { SentenceWriter } from '../sentence/SentenceWriter/SentenceWriter'

export const Route = createFileRoute('/sentence/$sentenceId')({
  component: SentencePage,
})

function SentencePage(): ReactElement {
  const { sentenceId } = Route.useParams()
  const navigate = useNavigate()
  const { data: sentence, isPending } = useQuery({
    queryKey: [SENTENCE_QUERY_KEY, sentenceId],
    queryFn: () => getSentence(Number(sentenceId)),
  })

  if (isPending) {
    return <article aria-busy="true" />
  }
  if (!sentence) {
    return <article>존재하지 않는 문장: {sentenceId}</article>
  }
  return (
    <article>
      <h2>문장</h2>
      <p>id: {sentence.sentenceId}</p>
      <SentenceWriter
        key={sentence.sentenceId}
        isEditable
        sentence={sentence}
        onDelete={() => navigate({ to: '/' })}
      />
    </article>
  )
}
