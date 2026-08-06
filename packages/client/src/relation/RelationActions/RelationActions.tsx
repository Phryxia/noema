import type { ReactElement } from 'react'

interface RelationActionsProps {
  isSubmitting: boolean
  isSubmittable: boolean
  isDeleting: boolean
  onDelete: (() => void) | null
}

export function RelationActions({
  isSubmitting,
  isSubmittable,
  isDeleting,
  onDelete,
}: RelationActionsProps): ReactElement {
  if (!onDelete) {
    return (
      <SubmitButton label="제출" isSubmitting={isSubmitting} isSubmittable={isSubmittable} />
    )
  }

  return (
    <div role="group">
      <SubmitButton label="수정" isSubmitting={isSubmitting} isSubmittable={isSubmittable} />
      <button
        type="button"
        className="secondary"
        disabled={isSubmitting || isDeleting}
        aria-busy={isDeleting}
        onClick={onDelete}
      >
        {!isDeleting && '삭제'}
      </button>
    </div>
  )
}

interface SubmitButtonProps {
  label: string
  isSubmitting: boolean
  isSubmittable: boolean
}

function SubmitButton({ label, isSubmitting, isSubmittable }: SubmitButtonProps): ReactElement {
  return (
    <button type="submit" disabled={!isSubmittable} aria-busy={isSubmitting}>
      {!isSubmitting && label}
    </button>
  )
}
