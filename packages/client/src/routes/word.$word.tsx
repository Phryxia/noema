import type { ReactElement } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { WORD_NODE_ID_QUERY_KEY } from '../word/consts'
import { getWordNodeId } from '../word/word.service'

export const Route = createFileRoute('/word/$word')({
  component: WordPage,
})

function WordPage(): ReactElement {
  const { word } = Route.useParams()
  const { data: nodeId, isPending } = useQuery({
    queryKey: [WORD_NODE_ID_QUERY_KEY, word],
    queryFn: () => getWordNodeId(word),
  })

  if (isPending) {
    return <article aria-busy="true" />
  }
  if (nodeId === null) {
    return <article>존재하지 않는 단어: {word}</article>
  }
  return (
    <article>
      <h2>{word}</h2>
      <p>id: {nodeId}</p>
    </article>
  )
}
