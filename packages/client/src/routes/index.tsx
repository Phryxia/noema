import type { ReactElement } from 'react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { WordWriter } from '../word/WordWriter/WordWriter'
import { SentenceWriter } from '../sentence/SentenceWriter/SentenceWriter'
import { DocumentWriter } from '../document/DocumentWriter/DocumentWriter'
import { RecentCreations } from '../recent/RecentCreations'
import { Statistic } from '../statistic/Statistic/Statistic'

export const Route = createFileRoute('/')({
  component: MainPage,
})

type WriterMode = '단어' | '문장' | '문서'

const WriterModes: WriterMode[] = ['단어', '문장', '문서']

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
      <WriterModeSelector mode={mode} onChange={setMode} />
      {mode === '단어' && <WordWriter isEditable />}
      {mode === '문장' && <SentenceWriter isEditable />}
      {mode === '문서' && <DocumentWriter isEditable />}
    </article>
  )
}

interface WriterModeSelectorProps {
  mode: WriterMode
  onChange: (mode: WriterMode) => void
}

function WriterModeSelector({ mode, onChange }: WriterModeSelectorProps): ReactElement {
  return (
    <fieldset role="group">
      {WriterModes.map((writerMode) => (
        <label key={writerMode}>
          <input
            type="radio"
            name="writerMode"
            checked={mode === writerMode}
            onChange={() => onChange(writerMode)}
          />
          {writerMode}
        </label>
      ))}
    </fieldset>
  )
}
