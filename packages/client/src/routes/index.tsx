import type { ReactElement } from 'react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { WordWriter } from '../word/WordWriter/WordWriter'
import { SentenceWriter } from '../sentence/SentenceWriter/SentenceWriter'
import { DocumentWriter } from '../document/DocumentWriter/DocumentWriter'
import { RecentCreations } from '../recent/RecentCreations'
import { Statistic } from '../statistic/Statistic/Statistic'
import { WriterModeSelector } from '../writer/WriterModeSelector/WriterModeSelector'
import { WriterModes } from '../writer/consts'
import type { WriterMode } from '../writer/types'

export const Route = createFileRoute('/')({
  component: MainPage,
})

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
      <WriterModeSelector
        name="writerMode"
        modes={WriterModes}
        mode={mode}
        onChange={setMode}
      />
      {mode === '단어' && <WordWriter isEditable />}
      {mode === '문장' && <SentenceWriter isEditable />}
      {mode === '문서' && <DocumentWriter isEditable />}
    </article>
  )
}
