export interface SentenceCard {
  id: number
  value: string
  prevId: number | null
  nextId: number | null
}

export interface SentenceCardList {
  headId: number | null
  nodes: Map<number, SentenceCard>
  nextId: number
}

export interface SplitResult {
  list: SentenceCardList
  insertedIds: number[]
}

const SPLIT_SEPARATOR = '\n\n\n'

export function createSentenceCardList(values: string[]): SentenceCardList {
  const nodes = new Map<number, SentenceCard>()
  values.forEach((value, index) => {
    nodes.set(index, {
      id: index,
      value,
      prevId: index > 0 ? index - 1 : null,
      nextId: index < values.length - 1 ? index + 1 : null,
    })
  })
  return { headId: values.length ? 0 : null, nodes, nextId: values.length }
}

export function listCards(list: SentenceCardList): SentenceCard[] {
  const cards: SentenceCard[] = []
  let cursor = list.headId
  while (cursor !== null) {
    const card = getCard(list, cursor)
    cards.push(card)
    cursor = card.nextId
  }
  return cards
}

export function updateCardValue(
  list: SentenceCardList,
  id: number,
  value: string,
): SentenceCardList {
  const nodes = new Map(list.nodes)
  nodes.set(id, { ...getCard(list, id), value })
  return { ...list, nodes }
}

export function mergeWithPrevious(list: SentenceCardList, id: number): SentenceCardList {
  const card = getCard(list, id)
  if (card.prevId === null) {
    return list
  }
  const previous = getCard(list, card.prevId)
  const nodes = new Map(list.nodes)
  nodes.set(previous.id, {
    ...previous,
    value: previous.value + card.value,
    nextId: card.nextId,
  })
  if (card.nextId !== null) {
    nodes.set(card.nextId, { ...getCard(list, card.nextId), prevId: previous.id })
  }
  nodes.delete(id)
  return { ...list, nodes }
}

export function splitCard(list: SentenceCardList, id: number, pieces: string[]): SplitResult {
  const [head = '', ...rest] = pieces
  const nodes = new Map(list.nodes)
  const card = getCard(list, id)
  let nextId = list.nextId
  let previous: SentenceCard = { ...card, value: head }
  const insertedIds: number[] = []

  for (const value of rest) {
    const inserted: SentenceCard = {
      id: nextId,
      value,
      prevId: previous.id,
      nextId: card.nextId,
    }
    nodes.set(previous.id, { ...previous, nextId: inserted.id })
    insertedIds.push(inserted.id)
    previous = inserted
    nextId += 1
  }
  nodes.set(previous.id, previous)
  if (insertedIds.length && card.nextId !== null) {
    nodes.set(card.nextId, { ...getCard(list, card.nextId), prevId: previous.id })
  }
  return { list: { ...list, nodes, nextId }, insertedIds }
}

export function removeCard(list: SentenceCardList, id: number): SentenceCardList {
  const card = getCard(list, id)
  const nodes = new Map(list.nodes)
  if (card.prevId !== null) {
    nodes.set(card.prevId, { ...getCard(list, card.prevId), nextId: card.nextId })
  }
  if (card.nextId !== null) {
    nodes.set(card.nextId, { ...getCard(list, card.nextId), prevId: card.prevId })
  }
  nodes.delete(id)
  return { ...list, headId: list.headId === id ? card.nextId : list.headId, nodes }
}

export function splitByTripleNewline(value: string): string[] | null {
  if (!value.includes(SPLIT_SEPARATOR)) {
    return null
  }
  return value
    .split(SPLIT_SEPARATOR)
    .map((piece) => piece.trim())
    .filter(Boolean)
}

function getCard(list: SentenceCardList, id: number): SentenceCard {
  const card = list.nodes.get(id)
  if (!card) {
    throw new Error(`존재하지 않는 문장 카드: ${id}`)
  }
  return card
}
