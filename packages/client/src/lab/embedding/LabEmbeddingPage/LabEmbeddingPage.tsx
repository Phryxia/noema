import type { ReactElement } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LabQuestionTypes } from '../consts'
import { ExperimentControls } from '../ExperimentControls/ExperimentControls'
import { ModelReport } from '../ModelReport/ModelReport'
import { ModelSelector } from '../ModelSelector/ModelSelector'
import { useEmbeddingLab } from '../useEmbeddingLab'
import { ExploreForm } from '../../../explore/ExploreForm/ExploreForm'
import { MIN_WORD_COUNT, WORD_COUNT_QUERY_KEY } from '../../../explore/consts'
import { QuestionTypeSelector } from '../../../explore/QuestionTypeSelector/QuestionTypeSelector'
import { getWordCount } from '../../../word/getWordCount'

export function LabEmbeddingPage(): ReactElement {
  const { data: wordCount, isPending } = useQuery({
    queryKey: [WORD_COUNT_QUERY_KEY],
    queryFn: getWordCount,
  })
  const hasEnoughWords = !!wordCount && wordCount >= MIN_WORD_COUNT
  const lab = useEmbeddingLab(hasEnoughWords)

  if (isPending) {
    return <article aria-busy="true" />
  }

  if (!hasEnoughWords) {
    return <article>단어가 부족하여 문제를 생성할 수 없습니다</article>
  }

  return (
    <article>
      <h2>임베딩 실험</h2>
      <QuestionTypeSelector
        availableTypes={LabQuestionTypes}
        checkedTypes={lab.explore.checkedTypes}
        onChange={lab.explore.setCheckedTypes}
      />
      <hr />
      <ExploreForm explore={lab.explore} />
      <hr />
      <ExperimentControls
        isLoaded={lab.isLoaded}
        isRunning={lab.isRunning}
        progress={lab.progress}
        onStart={lab.startExperiment}
      />
      <ModelSelector
        modelDims={lab.modelDims}
        selectedD={lab.selectedD}
        onSelect={lab.selectModel}
      />
      {lab.selectedD !== null && (
        <ModelReport trajectory={lab.trajectories[lab.selectedD] ?? []} />
      )}
    </article>
  )
}
