import type { ReactElement } from 'react'
import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { WordWriter } from '../word/WordWriter/WordWriter'
import { RecentWords } from '../word/RecentWords/RecentWords'
import { SentenceWriter } from '../sentence/SentenceWriter/SentenceWriter'
import { RecentSentences } from '../sentence/RecentSentences/RecentSentences'

export const Route = createFileRoute('/')({
  component: MainPage,
})

type WriterMode = '단어' | '문장' | '문서'

const WriterModes: WriterMode[] = ['단어', '문장', '문서']

function MainPage(): ReactElement {
  return (
    <article>
      <WriterSection />
      <RecentWords />
      <RecentSentences />
    </article>
  )
}

function WriterSection(): ReactElement {
  const [mode, setMode] = useState<WriterMode>('단어')

  return (
    <section>
      <WriterModeSelector mode={mode} onChange={setMode} />
      {mode === '단어' && <WordWriter isEditable />}
      {mode === '문장' && <SentenceWriter isEditable />}
    </section>
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
            disabled={writerMode === '문서'}
            onChange={() => onChange(writerMode)}
          />
          {writerMode}
        </label>
      ))}
    </fieldset>
  )
}
