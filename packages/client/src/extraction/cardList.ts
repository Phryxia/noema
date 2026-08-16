export interface Card {
  id: number
  value: string
  prevId: number | null
  nextId: number | null
}

export interface CardList {
  headId: number | null
  nodes: Map<number, Card>
  nextId: number
}

export interface SplitResult {
  list: CardList
  insertedIds: number[]
}

export function createCardList(values: string[]): CardList {
  const nodes = new Map<number, Card>()
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

export function listCards(list: CardList): Card[] {
  const cards: Card[] = []
  let cursor = list.headId
  while (cursor !== null) {
    const card = getCard(list, cursor)
    cards.push(card)
    cursor = card.nextId
  }
  return cards
}

export function updateCardValue(list: CardList, id: number, value: string): CardList {
  const nodes = new Map(list.nodes)
  nodes.set(id, { ...getCard(list, id), value })
  return { ...list, nodes }
}

export function mergeWithPrevious(list: CardList, id: number): CardList {
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

export function splitCard(list: CardList, id: number, pieces: string[]): SplitResult {
  const [head = '', ...rest] = pieces
  const nodes = new Map(list.nodes)
  const card = getCard(list, id)
  let nextId = list.nextId
  let previous: Card = { ...card, value: head }
  const insertedIds: number[] = []

  for (const value of rest) {
    const inserted: Card = {
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

export function removeCard(list: CardList, id: number): CardList {
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

function getCard(list: CardList, id: number): Card {
  const card = list.nodes.get(id)
  if (!card) {
    throw new Error(`존재하지 않는 카드: ${id}`)
  }
  return card
}
