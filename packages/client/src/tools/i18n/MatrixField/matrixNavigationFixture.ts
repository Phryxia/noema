import type { MatrixKeyInput } from './computeMatrixNavigation'

export const Matrix = [
  ['한국어', '영어'],
  ['사과', 'apple'],
  ['배', ''],
]

export function createInput(key: string, modifiers?: Partial<MatrixKeyInput>): MatrixKeyInput {
  return {
    key,
    shiftKey: false,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...modifiers,
  }
}

export function createSelection(caret: number): {
  selectionStart: number
  selectionEnd: number
} {
  return { selectionStart: caret, selectionEnd: caret }
}
