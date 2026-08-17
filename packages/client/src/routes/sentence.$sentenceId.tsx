import type { ReactElement } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SentenceDocuments } from '../d2s/SentenceDocuments/SentenceDocuments'
import { SentenceWords } from '../s2w/SentenceWords/SentenceWords'
import { SENTENCE_QUERY_KEY } from '../sentence/consts'
import { getSentence } from '../sentence/sentence.service'
import { SentenceWriter } from '../sentence/SentenceWriter/SentenceWriter'
import { MetaFields } from '../meta/MetaFields/MetaFields'
import { TAG_RELATIONS_QUERY_KEY } from '../tag/consts'
import { getTagEntries } from '../tag/tag.service'

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
  const { data: tags, isPending: isTagsPending } = useQuery({
    queryKey: [TAG_RELATIONS_QUERY_KEY, 'sentence', sentenceId],
    queryFn: () => getTagEntries({ type: 'sentence', id: Number(sentenceId) }),
  })

  if (isPending || isTagsPending) {
    return <article aria-busy="true" />
  }
  if (!sentence) {
    return <article>존재하지 않는 문장: {sentenceId}</article>
  }
  return (
    <article>
      <h2>문장</h2>
      <MetaFields
        fields={[
          { label: 'sentenceId', value: sentence.sentenceId },
          { label: 'createdAt', value: sentence.createdAt },
          { label: 'modifiedAt', value: sentence.modifiedAt },
        ]}
      />
      <SentenceWriter
        key={`writer-${sentence.sentenceId}`}
        isEditable
        sentence={sentence}
        tags={tags}
        onDelete={() => navigate({ to: '/' })}
      />
      <SentenceDocuments
        key={`documents-${sentence.sentenceId}`}
        sentenceId={sentence.sentenceId}
      />
      <SentenceWords key={`words-${sentence.sentenceId}`} sentence={sentence} />
    </article>
  )
}
