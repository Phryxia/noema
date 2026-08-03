import type { FormEvent, ReactElement } from 'react'
import { AnswerSection } from '../AnswerSection/AnswerSection'
import { QuestionPrompt } from '../QuestionPrompt/QuestionPrompt'
import { TextWriterField } from '../TextWriterField/TextWriterField'
import type { Explore } from '../useExplore'
import { TextWriterModes } from '../../writer/consts'
import classnames from 'classnames/bind'
import styles from './ExploreForm.module.css'

const cx = classnames.bind(styles)

interface ExploreFormProps {
  explore: Explore
}

export function ExploreForm({ explore }: ExploreFormProps): ReactElement {
  const { pick, isFetching, isSubmitting, isSubmittable, answer, comment, skip, save } = explore

  if (!isFetching && pick?.status === 'noType') {
    return <p>출제할 문제 유형을 하나 이상 선택하세요</p>
  }

  if (!isFetching && pick?.status === 'noWord') {
    return <p>고른 유형에 쓸 단어가 부족합니다. 단어를 더 추가해주세요</p>
  }

  const draft = !isFetching && pick?.status === 'ok' ? pick.draft : undefined

  function handleSubmit(event: FormEvent): void {
    event.preventDefault()
    save()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={cx('question')}>
        {draft ? (
          <>
            <QuestionPrompt draft={draft} />
            <AnswerSection
              draft={draft}
              answer={answer}
              onChange={explore.setAnswer}
              onSubmit={save}
            />
          </>
        ) : (
          <p className={cx('loading')} aria-busy="true" />
        )}
      </div>
      <h6 className={cx('commentLabel')}>참고사항</h6>
      <TextWriterField
        name="commentMode"
        modes={TextWriterModes}
        mode={comment.mode}
        value={comment.text}
        placeholder="(optional)"
        onModeChange={(mode) => explore.setComment({ ...comment, mode })}
        onChange={(text) => explore.setComment({ ...comment, text })}
        onSubmit={save}
      />
      <div role="group">
        <button
          type="button"
          className="secondary"
          disabled={isFetching || isSubmitting}
          onClick={skip}
        >
          건너뛰기
        </button>
        <button type="submit" disabled={!isSubmittable} aria-busy={isSubmitting}>
          {!isSubmitting && '제출'}
        </button>
      </div>
    </form>
  )
}
