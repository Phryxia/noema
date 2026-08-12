import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExploreForm } from '../ExploreForm/ExploreForm'
import { QuestionTypeSelector } from '../QuestionTypeSelector/QuestionTypeSelector'
import { UsageWordCountControl } from '../UsageWordCountControl/UsageWordCountControl'
import { ExploreQuestionTypes, MIN_WORD_COUNT, WORD_COUNT_QUERY_KEY } from '../consts'
import { useExplore } from '../useExplore'
import { getWordCount } from '../../word/getWordCount'

export function ExplorePage(): ReactElement {
  const { data: wordCount, isPending } = useQuery({
    queryKey: [WORD_COUNT_QUERY_KEY],
    queryFn: getWordCount,
  })
  const hasEnoughWords = !!wordCount && wordCount >= MIN_WORD_COUNT
  const explore = useExplore(hasEnoughWords, { availableTypes: ExploreQuestionTypes })

  if (isPending) {
    return <article aria-busy="true" />
  }

  if (!hasEnoughWords) {
    return <article>단어가 부족하여 문제를 생성할 수 없습니다</article>
  }

  return (
    <article>
      <h2>탐색</h2>
      <QuestionTypeSelector
        availableTypes={ExploreQuestionTypes}
        checkedTypes={explore.checkedTypes}
        onChange={explore.setCheckedTypes}
      />
      <UsageWordCountControl
        value={explore.usageWordCount}
        onChange={explore.setUsageWordCount}
      />
      <hr />
      <ExploreForm explore={explore} />
    </article>
  )
}
