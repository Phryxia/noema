import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PagedSection } from '../../shared/PagedSection'
import { TAG_RELATIONS_QUERY_KEY } from '../consts'
import { hydrateTagEntries } from '../hydrateTagEntries'
import { getTagRelationsByWord } from '../tag.service'
import { TagTable } from '../TagTable'

interface WordTagsProps {
  wordId: number
}

export function WordTags({ wordId }: WordTagsProps): ReactElement {
  const { data, isPending, error } = useQuery({
    queryKey: [TAG_RELATIONS_QUERY_KEY, 'word', wordId],
    queryFn: async () => hydrateTagEntries(await getTagRelationsByWord(wordId)),
    retry: false,
  })

  return (
    <PagedSection
      title="태그된 문장/문서"
      state={{ entries: data ?? [], isPending, error }}
      isLoaderVisible={false}
      renderTable={(pageEntries) => <TagTable entries={pageEntries} hiddenColumn="word" />}
    />
  )
}
