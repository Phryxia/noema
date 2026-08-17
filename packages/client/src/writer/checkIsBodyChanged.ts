interface Body {
  value: string
  source?: string
}

export function checkIsBodyChanged(draft: Body, saved: Body): boolean {
  return draft.value !== saved.value || draft.source !== (saved.source ?? '')
}
