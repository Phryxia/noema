export function computeAdjacentPairs<T>(items: T[]): [T, T][] {
  return items.slice(1).map((item, index) => [items[index], item])
}
