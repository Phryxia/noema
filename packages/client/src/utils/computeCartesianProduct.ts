export function computeCartesianProduct<T>(lists: T[][]): T[][] {
  return lists.reduce<T[][]>(
    (tuples, list) => tuples.flatMap((tuple) => list.map((item) => tuple.concat(item))),
    [[]],
  )
}
