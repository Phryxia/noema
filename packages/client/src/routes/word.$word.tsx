import type { ReactElement } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { WORD_NODE_QUERY_KEY } from '../word/consts'
import { getWordNode } from '../word/word.service'
import { MetaFields } from '../meta/MetaFields/MetaFields'

export const Route = createFileRoute('/word/$word')({
  component: WordPage,
})

function WordPage(): ReactElement {
  const { word } = Route.useParams()
  const { data: node, isPending } = useQuery({
    queryKey: [WORD_NODE_QUERY_KEY, word],
    queryFn: () => getWordNode(word),
  })

  if (isPending) {
    return <article aria-busy="true" />
  }
  if (!node) {
    return <article>존재하지 않는 단어: {word}</article>
  }
  return (
    <article>
      <h2>{word}</h2>
      <MetaFields
        fields={[
          { label: 'nodeId', value: node.nodeId },
          { label: 'parentNodeId', value: node.parentNodeId },
          { label: 'createdAt', value: node.createdAt },
        ]}
      />
    </article>
  )
}
