import type { ReactElement } from 'react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { RadioGroup } from '../shared/RadioGroup'
import { WordWriter } from '../word/WordWriter/WordWriter'
import { SentenceWriter } from '../sentence/SentenceWriter/SentenceWriter'
import { DocumentWriter } from '../document/DocumentWriter/DocumentWriter'
import { RecentCreations } from '../recent/RecentCreations'
import { Statistic } from '../statistic/Statistic/Statistic'
import { WriterModes } from '../writer/consts'
import type { WriterMode } from '../writer/types'

export const Route = createFileRoute('/')({
  component: MainPage,
})

const WriterModeOptions = WriterModes.map((mode) => ({
  value: mode,
  label: mode,
}))

function MainPage(): ReactElement {
  return (
    <article>
      <WriterSection />
      <RecentCreations />
      <Statistic />
    </article>
  )
}

function WriterSection(): ReactElement {
  const [mode, setMode] = useState<WriterMode>('단어')

  return (
    <article>
      <RadioGroup<WriterMode>
        name="writerMode"
        value={mode}
        options={WriterModeOptions}
        onChange={setMode}
      />
      {mode === '단어' && <WordWriter isEditable />}
      {mode === '문장' && <SentenceWriter isEditable />}
      {mode === '문서' && <DocumentWriter isEditable />}
    </article>
  )
}
