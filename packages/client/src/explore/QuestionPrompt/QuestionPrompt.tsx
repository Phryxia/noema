import type { ReactElement } from 'react'
import { checkIsWordChoice } from '../checkIsWordChoice'
import { getQuestionPrompt } from '../getQuestionPrompt'
import type { QuestionDraft } from '../types'
import classnames from 'classnames/bind'
import styles from './QuestionPrompt.module.css'

const cx = classnames.bind(styles)

interface QuestionPromptProps {
  draft: QuestionDraft
}

export function QuestionPrompt({ draft }: QuestionPromptProps): ReactElement {
  return (
    <section className={cx('root')}>
      <p>{getQuestionPrompt(draft.question)}</p>
      {!checkIsWordChoice(draft.question.type) && (
        <ul className={cx('words')}>
          {draft.lexes.map(({ nodeId, value }) => (
            <li key={nodeId}>{value}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
