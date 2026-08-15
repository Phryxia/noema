import type { ReactElement } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { WORD_NODE_QUERY_KEY } from '../word/consts'
import { getWordNode } from '../word/word.service'
import { WordEditor } from '../word/WordEditor/WordEditor'
import { WordRelations } from '../word/WordRelations/WordRelations'
import { MetaFields } from '../meta/MetaFields/MetaFields'

export const Route = createFileRoute('/word/$word')({
  component: WordPage,
})

function WordPage(): ReactElement {
  const { word } = Route.useParams()
  const navigate = useNavigate()
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
          { label: 'modifiedAt', value: node.modifiedAt },
        ]}
      />
      <WordEditor
        key={node.nodeId}
        node={node}
        word={word}
        onRenamed={(newValue) => navigate({ to: '/word/$word', params: { word: newValue } })}
        onDeleted={() => navigate({ to: '/' })}
      />
      <WordRelations key={word} word={word} />
    </article>
  )
}
