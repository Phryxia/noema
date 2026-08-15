export interface CaretLine {
  isFirstLine: boolean
  isLastLine: boolean
  x: number
}

export type LineEdge = 'first' | 'last'

const SENTINEL = '\u200b'

const MIRROR_STYLE_KEYS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'fontVariant',
  'letterSpacing',
  'wordSpacing',
  'lineHeight',
  'tabSize',
  'textIndent',
  'textTransform',
  'whiteSpace',
  'overflowWrap',
  'wordBreak',
  'direction',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
] as const

interface Mirror {
  text: Text
  contentLeft: number
  lineHeight: number
}

export function measureCaretLine(textarea: HTMLTextAreaElement, caret: number): CaretLine {
  return withMirror(textarea, (mirror) => {
    const rect = getCaretRect(mirror, caret)
    return {
      isFirstLine: checkIsSameLine(mirror, rect, getCaretRect(mirror, 0)),
      isLastLine: checkIsSameLine(mirror, rect, getCaretRect(mirror, textarea.value.length)),
      x: rect.left - mirror.contentLeft,
    }
  })
}

export function findCaretNearX(
  textarea: HTMLTextAreaElement,
  edge: LineEdge,
  x: number,
): number {
  return withMirror(textarea, (mirror) => {
    const length = textarea.value.length
    const start = edge === 'first' ? 0 : length
    const step = edge === 'first' ? 1 : -1
    const lineRect = getCaretRect(mirror, start)
    let best = start
    let bestDistance = Infinity
    for (let offset = start; offset >= 0 && offset <= length; offset += step) {
      const rect = getCaretRect(mirror, offset)
      if (!checkIsSameLine(mirror, rect, lineRect)) {
        break
      }
      const distance = Math.abs(rect.left - mirror.contentLeft - x)
      if (distance < bestDistance) {
        best = offset
        bestDistance = distance
      }
    }
    return best
  })
}

function withMirror<T>(textarea: HTMLTextAreaElement, callback: (mirror: Mirror) => T): T {
  const style = getComputedStyle(textarea)
  const element = document.createElement('div')
  for (const key of MIRROR_STYLE_KEYS) {
    element.style[key] = style[key]
  }
  element.style.position = 'absolute'
  element.style.top = '0'
  element.style.left = '0'
  element.style.visibility = 'hidden'
  element.style.pointerEvents = 'none'
  element.style.boxSizing = 'border-box'
  element.style.width = `${textarea.clientWidth}px`
  const text = document.createTextNode(textarea.value + SENTINEL)
  element.append(text)
  document.body.append(element)
  try {
    return callback({
      text,
      contentLeft: element.getBoundingClientRect().left + parseFloat(style.paddingLeft),
      lineHeight: parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.5,
    })
  } finally {
    element.remove()
  }
}

function getCaretRect(mirror: Mirror, offset: number): DOMRect {
  const range = document.createRange()
  range.setStart(mirror.text, offset)
  range.setEnd(mirror.text, offset + 1)
  const rect = range.getClientRects()[0]
  if (rect?.height) {
    return rect
  }
  range.collapse(true)
  return range.getBoundingClientRect()
}

function checkIsSameLine(mirror: Mirror, a: DOMRect, b: DOMRect): boolean {
  const centerA = a.top + a.height / 2
  const centerB = b.top + b.height / 2
  return Math.abs(centerA - centerB) < mirror.lineHeight / 2
}
