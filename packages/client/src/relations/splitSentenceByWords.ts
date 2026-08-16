import type { ResolvedRefToken, UsageSegment } from './types'

interface WordMatch {
  index: number
  word: ResolvedRefToken
}

export function splitSentenceByWords(
  sentence: string,
  words: ResolvedRefToken[],
): UsageSegment[] {
  const candidates = words.filter((word) => !!word.value)
  const segments: UsageSegment[] = []
  let cursor = 0
  while (cursor < sentence.length) {
    const match = findEarliestMatch(sentence, candidates, cursor)
    if (!match) {
      break
    }
    if (match.index > cursor) {
      segments.push({ kind: 'text', value: sentence.slice(cursor, match.index) })
    }
    segments.push(match.word)
    cursor = match.index + match.word.value.length
  }
  if (cursor < sentence.length) {
    segments.push({ kind: 'text', value: sentence.slice(cursor) })
  }
  return segments
}

function findEarliestMatch(
  sentence: string,
  words: ResolvedRefToken[],
  from: number,
): WordMatch | null {
  let best: WordMatch | null = null
  for (const word of words) {
    const index = sentence.indexOf(word.value, from)
    if (index < 0) {
      continue
    }
    if (
      !best ||
      index < best.index ||
      (index === best.index && word.value.length > best.word.value.length)
    ) {
      best = { index, word }
    }
  }
  return best
}
